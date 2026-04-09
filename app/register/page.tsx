'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerSchema } from '@/lib/auth/validators';
import useSWRMutation from 'swr/mutation';
import Input from '@/components/Input';
// تعريف نوع الاستجابة من API
type RegisterResponse = { ok: true } | { ok: false; error: string };
// دالة إرسال الطلب (Fetcher)
async function registerFetcher(
	url: string,
	{ arg }: { arg: { name: string; email: string; password: string } }
): Promise<RegisterResponse> {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(arg),
		credentials: 'include', // مهم لإرسال واستقبال الكوكيز
	});
	const data = await res.json();

	return data;
}
export default function RegisterPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	// استخدام SWR Mutation  انشاء حساب
	const { trigger, isMutating } = useSWRMutation<RegisterResponse>(
		'/api/auth/register',
		registerFetcher
	);

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	// Google Callback (نفس login)
	const handleGoogleResponse = async (response: any) => {
		setGoogleLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: response.credential }),
			});

			const data = await res.json();

			if (data.ok) {
				const from = searchParams.get('from') || '/dashboard';
				router.push(from);
				router.refresh(); // لتحديث حالة الجلسة
			} else {
				setError(data.error || 'فشل التسجيل عبر جوجل');
			}
		} catch {
			setError('خطأ في الاتصال بالخادم');
		} finally {
			setGoogleLoading(false);
		}
	};

	// Register Normal
	async function handleRegister() {
		if (loading) return;

		setError(null);

		const parsed = registerSchema.safeParse(form);

		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message || 'بيانات غير صحيحة');
			return;
		}

		if (form.password !== form.confirmPassword) {
			setError('كلمتا المرور غير متطابقتين');
			return;
		}

		setLoading(true);

		try {
			const result = await trigger(parsed.data);

			if (result && result.ok) {
				const from = searchParams.get('from') || '/dashboard';
				router.push(from);
				router.refresh();
			} else {
				setError(result?.error || 'حدث خطأ ما أثناء التسجيل');
			}
		} catch (err: any) {
			// هذا الـ catch يلتقط الأخطاء من fetcher فقط إذا رميت throw
			console.error('SWR Error:', err);
			setError(err.message || 'خطأ في الشبكة');
		} finally {
			setLoading(false);
		}
	}

	return (
		<main
			dir="rtl"
			className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4"
		>
			{/* تحميل Google SDK */}
			<Script
				src="https://accounts.google.com/gsi/client"
				onLoad={() => {
					google.accounts.id.initialize({
						client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
						callback: handleGoogleResponse,
					});

					google.accounts.id.renderButton(document.getElementById('googleBtn'), {
						theme: 'filled_black',
						size: 'large',
						width: 250,
						text: 'continue_with',
						shape: 'pill',
					});
				}}
			/>

			<div className="w-full max-w-md">
				{/* Header */}
				<div className="mb-8 text-center space-y-3">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-widest text-slate-300">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
						منصة إدارة مالية
					</div>

					<h1 className="text-3xl font-semibold text-white">إنشاء حساب جديد</h1>

					<p className="text-sm text-slate-400">ابدأ بتنظيم دخلك ومصاريفك بسهولة</p>
				</div>

				{/* Card */}
				<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl space-y-5 flex flex-col justify-center ">
					{/* Google */}
					<div
						id="googleBtn"
						className={`w-full flex items-center justify-center ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
					/>

					{/* Divider */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-white/10"></span>
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-[#0b1120] px-2 text-slate-500">أو عبر البريد الإلكتروني</span>
						</div>
					</div>

					{/* Inputs */}
					<div className="space-y-3">
						<Input
							label="الاسم"
							value={form.name}
							onChange={(v) => setForm({ ...form, name: v })}
						/>
						<Input
							label="البريد الإلكتروني"
							value={form.email}
							onChange={(v) => setForm({ ...form, email: v })}
						/>
						<Input
							label="كلمة المرور"
							type="password"
							value={form.password}
							onChange={(v) => setForm({ ...form, password: v })}
						/>
						<Input
							label="تأكيد كلمة المرور"
							type="password"
							value={form.confirmPassword}
							onChange={(v) => setForm({ ...form, confirmPassword: v })}
						/>
					</div>

					{/* Error */}
					{error && (
						<div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
							{error}
						</div>
					)}

					{/* Button */}
					<button
						disabled={loading || googleLoading}
						onClick={handleRegister}
						className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition"
					>
						{loading || googleLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
					</button>

					{/* Footer */}
					<div className="text-center text-xs text-slate-400 space-y-2">
						<p>
							لديك حساب؟{' '}
							<Link href="/login" className="text-emerald-400">
								تسجيل الدخول
							</Link>
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
