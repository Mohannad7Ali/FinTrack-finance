// app/(dashboard)/settings/page.tsx
'use client';

import { useME } from '@/hooks/useMe';
import SettingsTabs from './components/SettingsTabs';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
	const { data, isLoading, error } = useME();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
			</div>
		);
	}

	if (!data.ok || !data.authenticated) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
				<div className="text-red-400">حدث خطأ في تحميل بيانات المستخدم</div>
			</div>
		);
	}

	const user = {
		id: data.userId!,
		name: data.name!,
		email: data.email!,
		image: data.image,
		preferredCurrency: (data as any).preferredCurrency || 'SYP',
		provider: (data as any).provider,
	};

	return (
		<main
			className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6"
			dir="rtl"
		>
			<div className="max-w-2xl mx-auto">
				<h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>
				<div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
					<SettingsTabs user={user} />
				</div>
			</div>
		</main>
	);
}
