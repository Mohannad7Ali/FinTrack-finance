'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordSchema = z
	.object({
		currentPassword: z.string().min(6, 'كلمة المرور الحالية يجب أن تكون 6 أحرف على الأقل'),
		newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'كلمتا المرور غير متطابقتين',
		path: ['confirmPassword'],
	});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordForm({ provider }: { provider?: string | null }) {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
	});

	if (provider == 'google') {
		return (
			<div className="text-center p-6 border border-white/10 rounded-xl bg-white/5">
				<p className="text-slate-300">أنت مسجل عبر جوجل ، لا يمكنك تغيير كلمة المرور.</p>
			</div>
		);
	}

	const onSubmit = async (data: PasswordFormValues) => {
		setIsLoading(true);
		setMessage(null);
		try {
			const res = await fetch('/api/user/password', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					currentPassword: data.currentPassword,
					newPassword: data.newPassword,
				}),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error);
			setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
			reset();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-2">
				<Label>كلمة المرور الحالية</Label>
				<Input
					type="password"
					{...register('currentPassword')}
					className={errors.currentPassword ? 'border-red-500' : ''}
				/>
				{errors.currentPassword && (
					<p className="text-red-400 text-xs">{errors.currentPassword.message}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label>كلمة المرور الجديدة</Label>
				<Input
					type="password"
					{...register('newPassword')}
					className={errors.newPassword ? 'border-red-500' : ''}
				/>
				{errors.newPassword && <p className="text-red-400 text-xs">{errors.newPassword.message}</p>}
			</div>
			<div className="space-y-2">
				<Label>تأكيد كلمة المرور الجديدة</Label>
				<Input
					type="password"
					{...register('confirmPassword')}
					className={errors.confirmPassword ? 'border-red-500' : ''}
				/>
				{errors.confirmPassword && (
					<p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
				)}
			</div>
			{message && (
				<div
					className={`p-3 rounded ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}
				>
					{message.text}
				</div>
			)}
			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
			</Button>
		</form>
	);
}
