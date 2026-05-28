import { NextRequest, NextResponse } from 'next/server';

// الملفات الثابتة التي لا نريد تشغيل middleware عليها مطلقاً
const PUBLIC_FILE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.ico', '.webp', '.avif'];

// الصفحات التي يمكن الوصول إليها دون تسجيل دخول (عامة)
const PUBLIC_PAGES = ['/login', '/register', '/recovery', '/maintenance'];

// الصفحات التي إذا كان المستخدم مسجلاً دخوله، يُعاد توجيهه منها إلى dashboard
// (تشمل root وأيضاً صفحات المصادقة)
const AUTH_REDIRECT_PAGES = ['/', '/login', '/register', '/recovery'];

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

// الدالة الأساسية التي ستُستخدم كـ middleware
export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// 1️⃣ وضع الصيانة
	if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/maintenance') {
		return NextResponse.redirect(new URL('/maintenance', req.url));
	}

	// 2️⃣ تجاهل الملفات الثابتة
	if (PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
		return NextResponse.next();
	}

	// 3️⃣ التحقق من التوكن
	const token = req.cookies.get('token')?.value;
	const isAuthenticated = !!token;

	// 4️⃣ تحديد نوع المسار
	const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
	const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
	const isProtectedPage = PROTECTED_PAGES.some(
		(p) => pathname === p || pathname.startsWith(`${p}/`)
	);
	const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));

	// 5️⃣ مستخدم موثق يزور صفحة مصادقة أو الصفحة الرئيسية → يُنقل إلى dashboard
	if (isAuthenticated && AUTH_REDIRECT_PAGES.includes(pathname)) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// 6️⃣ مستخدم غير موثق يحاول دخول صفحة محمية أو API محمية
	if (!isAuthenticated && (isProtectedPage || isProtectedApi)) {
		// API محمية → 401
		if (isProtectedApi) {
			return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
		}
		// صفحة محمية → توجيه إلى login مع حفظ المسار الأصلي
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// 7️⃣ جميع الحالات الأخرى: السماح
	return NextResponse.next();
}

// تحسين الأداء: تشغيل middleware فقط على المسارات المطلوبة
export const config = {
	matcher: [
		/*
		 * استثناء المجلدات الداخلية لـ Next.js والملفات الثابتة
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
