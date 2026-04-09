'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import useSWRMutation from 'swr/mutation';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema } from '@/lib/auth/validators';

// تعريف نوع الاستجابة من API
type LoginResponse = { ok: true } | { ok: false; error: string };

// دالة إرسال الطلب (Fetcher)
async function loginFetcher(
	url: string,
	{ arg }: { arg: { email: string; password: string } }
): Promise<LoginResponse> {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(arg),
		credentials: 'include', // مهم لإرسال واستقبال الكوكيز
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.error || 'فشل تسجيل الدخول');
	}

	return data;
}

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [googleLoading, setGoogleLoading] = useState(false);

	// تحديد مسار إعادة التوجيه بعد تسجيل الدخول
	const from = searchParams.get('from') || '/dashboard';

	// استخدام SWR Mutation لتسجيل الدخول
	const { trigger, isMutating } = useSWRMutation<
		LoginResponse,
		Error,
		string,
		{ email: string; password: string }
	>('/api/auth/login', loginFetcher);

	//  تسجيل الدخول التقليدي
	const handleLogin = async () => {
		setError(null);

		const parsed = loginSchema.safeParse({ email, password });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
			return;
		}

		try {
			const data = await trigger(parsed.data);

			if (data.ok) {
				router.push(from);
				router.refresh(); // لتحديث حالة الجلسة
			}
		} catch (err: any) {
			setError(err.message || 'حدث خطأ غير متوقع');
		}
	};

	//  تسجيل الدخول عبر Google
	const handleGoogleResponse = async (response: any) => {
		setGoogleLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: response.credential }),
				credentials: 'include',
			});

			const data = await res.json();

			if (!res.ok || !data.ok) {
				throw new Error(data.error || 'فشل تسجيل الدخول عبر جوجل');
			}

			router.push(from);
			router.refresh();
		} catch (err: any) {
			setError(err.message || 'حدث خطأ في الاتصال بالخادم');
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<main
			className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4"
			dir="rtl"
		>
			{/* تحميل مكتبة Google Identity Services */}
			<Script
				src="https://accounts.google.com/gsi/client"
				strategy="afterInteractive"
				onLoad={() => {
					if (typeof window !== 'undefined' && (window as any).google) {
						(window as any).google.accounts.id.initialize({
							client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
							callback: handleGoogleResponse,
						});

						(window as any).google.accounts.id.renderButton(document.getElementById('googleBtn'), {
							theme: 'filled_black',
							size: 'large',
							width: 280,
							text: 'continue_with',
							shape: 'circle',
						});
					}
				}}
			/>

			<div className="w-full max-w-md ">
				{/* العنوان */}
				<div className="mb-8 text-center space-y-2">
					<div className="inline-flex items-center gap-2 animate-pulse rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-slate-300">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
						نظام الإدارة المالية الشخصي
					</div>
					<h1 className="text-3xl font-semibold text-white mt-3 ">مرحباً بك مجدداً</h1>
					<p className="text-sm text-slate-400">سجل دخولك لمتابعة نفقاتك وميزانيتك الشهرية.</p>
				</div>

				{/* بطاقة تسجيل الدخول */}
				<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-3xl p-6 shadow-2xl space-y-5">
					{/* زر تسجيل الدخول عبر Google */}
					<div
						id="googleBtn"
						className={`flex justify-center py-3 transition-opacity ${
							googleLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
						}`}
					/>

					{/* فاصل */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-white/10"></span>
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-[#0b1120] px-2 text-slate-500">أو عبر البريد الإلكتروني</span>
						</div>
					</div>

					{/* نموذج تسجيل الدخول */}
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-xs font-medium  text-slate-200">البريد الإلكتروني</label>
							<input
								type="email"
								className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all mt-2"
								placeholder="name@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								autoComplete="email"
							/>
						</div>

						<div className="space-y-1.5">
							<div className="flex justify-between items-center">
								<label className="text-xs font-medium text-slate-200">كلمة المرور</label>
								<Link
									href="/recovery"
									className="text-[10px] text-emerald-400 hover:text-emerald-300"
								>
									نسيت كلمة المرور؟
								</Link>
							</div>
							<input
								type="password"
								className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm mt-1 text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
							/>
						</div>
					</div>

					{/* عرض رسالة الخطأ */}
					{error && (
						<div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
							{error}
						</div>
					)}

					{/* زر تسجيل الدخول */}
					<button
						disabled={isMutating || googleLoading}
						onClick={handleLogin}
						className="w-full rounded-xl cursor-pointer bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
					>
						{isMutating ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
					</button>

					{/* روابط إضافية */}
					<div className="pt-2 text-center text-[12px] space-y-3">
						<p className="text-slate-400">
							ليس لديك حساب؟{' '}
							<Link
								href="/register"
								className="text-emerald-400 cursor-pointer hover:text-emerald-300 font-medium"
							>
								إنشاء حساب جديد
							</Link>
						</p>
						<Link
							href="/"
							className="inline-block text-slate-500 hover:text-slate-300 transition-colors"
						>
							⟵ العودة للرئيسية
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
