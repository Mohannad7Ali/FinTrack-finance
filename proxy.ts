import { NextRequest, NextResponse } from 'next/server';

// الملفات الثابتة التي لا نريد تشغيل middleware عليها مطلقاً
const PUBLIC_FILE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.ico', '.webp', '.avif'];

// الصفحات التي يمكن الوصول إليها دون تسجيل دخول
const PUBLIC_PAGES = ['/login', '/register', '/', '/recovery', '/maintenance'];

// واجهات API العامة (مثل تسجيل الدخول والتسجيل)
const PUBLIC_API_PREFIXES = ['/api/auth'];

// جميع الصفحات التي تحتاج حماية (كل الصفحات الداخلية)
const PROTECTED_PAGES = [
	'/dashboard',
	'/categories',
	'/wallets',
	'/transactions',
	'/reports',
	'/settings',
	'/profile',
	// يمكنك إضافة أي مسار آخر يتطلب مصادقة
];

// واجهات API المحمية (تتطلب توكن)
const PROTECTED_API_PREFIXES = [
	'/api/summary',
	'/api/transactions',
	'/api/wallets',
	'/api/categories',
	'/api/reports',
	'/api/settings',
	'/api/user/password',
	'/api/user/profile',
	'/api/user/upload-image',
];

export function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/maintenance') {
		return NextResponse.redirect(new URL('/maintenance', req.url));
	}
	// 1️⃣ تجاهل الملفات الثابتة تماماً (تحسين الأداء)
	if (PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
		return NextResponse.next();
	}

	// 2️⃣ التحقق من وجود التوكن في الكوكيز
	const token = req.cookies.get('token')?.value;
	const isAuthenticated = !!token;

	// 3️⃣ التحقق مما إذا كان المسار عاماً (public page)
	const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
	const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));

	// 4️⃣ التحقق مما إذا كان المسار محمياً (protected)
	const isProtectedPage = PROTECTED_PAGES.some(
		(p) => pathname === p || pathname.startsWith(`${p}/`)
	);
	const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

	// 5️⃣ الحالة 1: مستخدم موثّق يحاول دخول صفحة تسجيل الدخول أو التسجيل → يذهب للوحة التحكم
	if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// 6️⃣ الحالة 2: مستخدم غير موثّق يحاول دخول صفحة محمية أو API محمية
	if (!isAuthenticated && (isProtectedPage || isProtectedApi)) {
		// إذا كانت API محمية → إرجاع 401
		if (isProtectedApi) {
			return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
		}
		// إذا كانت صفحة محمية → توجيه إلى /login مع حفظ المسار الأصلي
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// 7️⃣ باقي الحالات (public pages / public APIs / أو مستخدم موثّق في صفحة محمية) → السماح
	return NextResponse.next();
}

// إعداد matcher لتحسين الأداء (تشغيل middleware فقط على المسارات المطلوبة)
export const config = {
	matcher: [
		/*
		 * استثناء المجلدات الداخلية لـ Next.js والملفات الثابتة
		 * نطبق middleware على جميع المسارات باستثناء:
		 * - _next/static
		 * - _next/image
		 * - favicon.ico
		 * - ملفات media مثل الصور (يمكن الاستغناء عنها لأننا نستثنيها في PUBLIC_FILE_EXTENSIONS)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
