export async function fetcher<T>(url: string): Promise<T> {
	const res = await fetch(url, {
		credentials: 'include', // لإرسال الكوكيز الخاصة بالمصادقة
	});

	if (res.status === 401) {
		// إعادة التوجيه إلى صفحة تسجيل الدخول في حال عدم المصادقة
		if (typeof window !== 'undefined') {
			const redirectUrl = new URL('/login', window.location.origin);
			redirectUrl.searchParams.set('from', '/dashboard');
			window.location.href = redirectUrl.toString();
		}
		throw new Error('Unauthorized');
	}

	const data = await res.json();

	if (!res.ok || data.ok === false) {
		throw new Error(data.error || 'حدث خطأ أثناء جلب البيانات');
	}

	return data;
}
