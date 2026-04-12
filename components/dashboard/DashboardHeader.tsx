'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { weekdaysAr, monthNamesAr } from '@/lib/constants/date.constant';
import { useWeather } from '@/hooks/useWeather';
import { useME } from '@/hooks/useMe';

interface Props {
	month: number;
	year: number;
	onLogout: () => void;
}

function DashboardHeaderComponent({ month, year, onLogout }: Props) {
	// جلب البيانات من الـ Hooks
	const { weather, isLoading: isWeatherLoading, error: weatherError, refetch } = useWeather();
	const { data: userData } = useME();

	// حسابات التاريخ الحالي
	const today = new Date();
	const currentDayName = weekdaysAr[today.getDay()];
	const currentDayNumber = today.getDate();
	const currentMonthName = monthNamesAr[today.getMonth()];
	const currentFullYear = today.getFullYear();

	return (
		<header
			dir="rtl"
			className="relative w-full overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 md:px-8 md:py-7 bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl"
		>
			{/* تأثير ضوئي خلفي بسيط */}
			<div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />

			<div className="flex flex-col gap-4 z-10">
				{/* شارة النظام */}
				<div className="w-fit inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-400">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
					نظام الإدارة المالية الذكي
				</div>

				{/* الترحيب والعنوان */}
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
						<span className="bg-white/10 p-2 rounded-xl shadow-inner">📊</span>
						لوحة التحكم
						<span className="text-slate-500 font-light text-xl md:text-2xl mr-2">
							— {month.toString().padStart(2, '0')}/{year}
						</span>
					</h1>

					<div className="mt-2 flex flex-col gap-1">
						<h2 className="text-lg md:text-xl text-slate-200 font-medium">
							أهلاً بك،{' '}
							<span className="text-purple-400">{userData?.name || 'مستخدمنا العزيز'}</span> ✨
						</h2>
						<p className="text-sm text-slate-400 flex items-center gap-2">
							<span>📅</span>
							اليوم هو {currentDayName}، {currentDayNumber} {currentMonthName} {currentFullYear}
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row items-center gap-4 z-10">
				{/* قسم الطقس  */}
				<div className="w-full sm:w-auto flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors duration-300 rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-xl">
					{isWeatherLoading ? (
						<div className="flex items-center gap-3 text-slate-400 text-sm">
							<div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
							جاري تحديث الأجواء...
						</div>
					) : weatherError ? (
						<div className="text-slate-400 text-xs flex items-center gap-2">
							<span className="text-orange-400">⚠️</span>
							{weatherError}
							<button
								onClick={() => refetch()}
								className="bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition text-emerald-400"
							>
								تحديث
							</button>
						</div>
					) : weather ? (
						<div className="flex items-center gap-3">
							<span className="text-3xl drop-shadow-md">{weather.conditionIcon}</span>
							<div className="flex flex-col leading-tight">
								<span className="text-sm font-bold text-white">
									{weather.temp}°C {weather.condition}
								</span>
								<span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
									{weather.location}
								</span>
							</div>
						</div>
					) : null}
				</div>

				{/* أزرار الإجراءات */}
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<Link
						href="/categories"
						className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 text-sm font-semibold hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-indigo-900/20"
					>
						<span>📁</span>
						الفئات
					</Link>

					<button
						onClick={onLogout}
						className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-semibold hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-300"
					>
						<span>🚪</span>
						خروج
					</button>
				</div>
			</div>
		</header>
	);
}

export const DashboardHeader = memo(DashboardHeaderComponent);
