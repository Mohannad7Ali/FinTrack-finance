'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { loginSchema } from '@/lib/auth/validators';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [erro, setErro] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	// منطق تسجيل دخول جوجل (Callback)
	const handleGoogleResponse = async (response: any) => {
		setGoogleLoading(true);
		setErro(null);

		try {
			const res = await fetch('/api/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: response.credential }),
			});

			const data = await res.json();

			if (data.ok) {
				const from = new URLSearchParams(window.location.search).get('from') || '/dashboard';
				window.location.href = from;
			} else {
				setErro(data.error || 'فشل تسجيل الدخول عبر جوجل');
			}
		} catch {
			setErro('حدث خطأ في الاتصال بالخادم');
		} finally {
			setGoogleLoading(false);
		}
	};

	//  منطق تسجيل الدخول التقليدي
	async function handleLogin() {
		setErro(null);
		const parsed = loginSchema.safeParse({ email, password });

		if (!parsed.success) {
			setErro(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
			return;
		}

		setLoading(true);
		try {
			const r = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			});

			if (!r.ok) {
				const j = await r.json().catch(() => ({}));
				setErro(j.error || 'فشل تسجيل الدخول');
				return;
			}

			const from = new URLSearchParams(window.location.search).get('from') || '/dashboard';
			window.location.href = from;
		} catch {
			setErro('خطأ في الشبكة');
		} finally {
			setLoading(false);
		}
	}

	return (
		<main
			className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 dir-rtl"
			dir="rtl"
		>
			{/* تحميل مكتبة جوجل */}
			<Script
				src="https://accounts.google.com/gsi/client"
				onLoad={() => {
					google.accounts.id.initialize({
						client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
						callback: handleGoogleResponse,
					});

					google.accounts.id.renderButton(document.getElementById('googleBtn'), {
						theme: 'filled_black',
						size: 'large',
						width: 350,
						text: 'continue_with',
						shape: 'circle',
					});
				}}
			/>

			<div className="w-full max-w-md">
				<div className="mb-8 text-center space-y-2">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-slate-300">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
						نظام الإدارة المالية
					</div>
					<h1 className="text-3xl font-semibold text-white mt-3">مرحباً بك مجدداً</h1>
					<p className="text-sm text-slate-400">سجل دخولك لمتابعة نفقاتك وميزانيتك الشهرية.</p>
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-5">
					{/* أزرار تسجيل الدخول الاجتماعي */}
					<div className="space-y-3">
						<div
							id="googleBtn"
							className={`w-full transition-opacity ${googleLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
						></div>
					</div>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-white/10"></span>
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-[#0b1120] px-2 text-slate-500">أو عبر البريد الإلكتروني</span>
						</div>
					</div>

					{/* نموذج البريد الإلكتروني */}
					<div className="space-y-4">
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-slate-200 mr-1">البريد الإلكتروني</label>
							<input
								className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
								placeholder="name@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						<div className="space-y-1.5">
							<div className="flex justify-between items-center">
								<label className="text-xs font-medium text-slate-200 mr-1">كلمة المرور</label>
								<Link
									href="/recovery"
									className="text-[10px] text-emerald-400 hover:text-emerald-300"
								>
									نسيت كلمة المرور؟
								</Link>
							</div>
							<input
								className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					{erro && (
						<div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1">
							{erro}
						</div>
					)}

					<button
						disabled={loading || googleLoading}
						onClick={handleLogin}
						className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
					>
						{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
					</button>

					<div className="pt-2 text-center text-[12px] space-y-3">
						<p className="text-slate-400">
							ليس لديك حساب؟{' '}
							<Link
								href="/register"
								className="text-emerald-400 hover:text-emerald-300 font-medium"
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
