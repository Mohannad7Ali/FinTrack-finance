'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import AvatarUpload from './AvatarUpload';
import { useME } from '@/hooks/useMe';
import { User } from '@/types/user';

const profileSchema = z.object({
	name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
	preferredCurrency: z.string().length(3, 'العملة يجب أن تكون من 3 أحرف'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ user }: { user: User }) {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const { refresh } = useME();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user.name,
			preferredCurrency: user.preferredCurrency || 'SYP',
		},
	});

	const onSubmit = async (data: ProfileFormValues) => {
		setIsLoading(true);
		setMessage(null);
		try {
			const res = await fetch('/api/user/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error);
			setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
			refresh();
		} catch (err: any) {
			setMessage({ type: 'error', text: err.message });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<AvatarUpload currentImage={user.image} userId={user.id} />
			<div className="space-y-2">
				<Label>الاسم</Label>
				<Input
					{...register('name')}
					placeholder="أدخل اسمك"
					className={errors.name ? 'border-red-500' : ''}
				/>
				{errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
			</div>
			<div className="space-y-2">
				<Label>العملة المفضلة</Label>
				<Select
					onValueChange={(val) => setValue('preferredCurrency', val)}
					defaultValue={watch('preferredCurrency')}
				>
					<SelectTrigger>
						<SelectValue placeholder="اختر العملة" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="SYP">ليرة سورية (SYP)</SelectItem>
						<SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
						<SelectItem value="EUR">يورو (EUR)</SelectItem>
						<SelectItem value="TRY">ليرة تركية (TRY)</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{message && (
				<div
					className={`p-3 rounded ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}
				>
					{message.text}
				</div>
			)}
			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
			</Button>
		</form>
	);
}
