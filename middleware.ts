import { NextRequest, NextResponse } from 'next/server';

// القائمة البيضاء: المسارات التي لا تتطلب حماية (مثل تسجيل الدخول)
const PUBLIC_FILE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.ico'];

const PROTECTED_PAGES = ['/dashboard'];
const PROTECTED_API_PREFIXES = [
	'/api/summary',
	'/api/transactions',
	'/api/budgets',
	'/api/wallets',
];

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	//  استثناء الملفات الثابتة (Performance)
	if (PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
		return NextResponse.next();
	}
	//  تحديد نوع المسار المطلوب
	const isProtectedPage = PROTECTED_PAGES.some((p) => pathname.startsWith(p));
	const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
	// إذا كان المسار عاماً، استمر فوراً
	if (!isProtectedPage && !isProtectedApi) {
		return NextResponse.next();
	}
	//  التحقق من وجود التوكن
	const token = req.cookies.get('token')?.value;
	if (!token) {
		// حالة أ: محاولة الوصول لـ API بدون توكن -> ارجاع JSON 401
		if (isProtectedApi) {
			return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
		}
		// حالة ب: محاولة الوصول لصفحة بدون توكن -> إعادة التوجيه لصفحة تسجيل الدخول
		const loginUrl = new URL('/login', req.url);
		// حفظ المسار الذي كان يحاول المستخدم الوصول إليه ليعود له بعد تسجيل الدخول
		loginUrl.searchParams.set('from', pathname);

		return NextResponse.redirect(loginUrl);
	}
	// إذا وجد التوكن، اسمح بالمرور
	return NextResponse.next();
}
//  ضبط الـ Matcher بدقة لتحسين الأداء
export const config = {
	matcher: [
		/*
		 * استثناء المسارات التي لا تحتاج تشغيل الـ middleware عليها نهائياً:
		 * - _next/static (ملفات ثابتة)
		 * - _next/image (تحسين الصور)
		 * - favicon.ico (أيقونة الموقع)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};
