'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { weekdaysAr, monthNamesAr } from '@/lib/constants/date.constant';
import { useWeather } from '@/hooks/useWeather';
import { useME } from '@/hooks/useMe';
type Props = {
	month: number;
	year: number;
	onLogout: () => void;
};

type WeatherData = {
	temp: number;
	condition: string; // بالعربية
	icon: string; // أيقونة تعبيرية
	location: string;
};

export function DashboardHeader({ month, year, onLogout }: Props) {
	const { weather, isLoading, error, refetch } = useWeather();
	const userData = useME();
	const today = new Date();
	const currentDayName = weekdaysAr[today.getDay()];
	const currentDayNumber = today.getDate();
	const currentMonthName = monthNamesAr[today.getMonth()];
	const currentYear = today.getFullYear();
	const displayMonthName = monthNamesAr[month - 1];

	return (
		<header
			dir="rtl"
			className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 md:px-10 md:py-6 bg-gradient-to-l from-indigo-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/10"
		>
			{/* قسم العنوان والتاريخ */}
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
					<span>📊</span> لوحة التحكم
				</h1>
				<h2 className="text-xl md:text-xl font-bold text-white flex items-center gap-2">
					<span>👋 أهلاً بك</span>
					{userData.data?.name ? userData.data?.name : ''}
				</h2>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 text-lg">
					<span className="hidden md:inline text-slate-500">|</span>
					<span className="flex items-center gap-1 text-emerald-300">
						<span>🕊️</span> اليوم:
						<span className="font-semibold text-white">
							{currentDayName} {currentDayNumber} {monthNamesAr[today.getMonth()]} {currentYear}
						</span>
					</span>
				</div>
				<p className="text-slate-400 text-sm md:text-base mt-1">
					نظرة عامة على وضعك المالي لهذا الشهر.
				</p>
			</div>

			{/* قسم الطقس */}
			<div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/10 backdrop-blur-sm">
				{isLoading ? (
					<div className="flex items-center gap-2 text-slate-400">
						<span className="animate-pulse">⏳</span> جلب الطقس...
					</div>
				) : error ? (
					<div className="text-slate-400 text-sm flex items-center gap-1">
						<span>⚠️</span> {error}
						<button onClick={refetch} className="mr-2 text-xs underline">
							إعادة المحاولة
						</button>
					</div>
				) : weather ? (
					<div className="flex items-center gap-3 text-white">
						<div className="text-3xl">{weather.conditionIcon}</div>
						<div className="flex flex-col">
							<span className="text-lg font-semibold">
								{weather.condition} • {weather.temp}°C
							</span>
							<span className="text-xs text-slate-400">{weather.location}</span>
						</div>
					</div>
				) : null}
			</div>

			{/* أزرار الإجراءات */}
			<div className="flex items-center gap-3 self-start lg:self-auto">
				<Link
					href="/categories"
					className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-200"
				>
					<span>🧾</span> إدارة الفئات
				</Link>
				<button
					onClick={onLogout}
					className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 font-medium hover:bg-red-500/20 transition-all duration-200"
				>
					<span>🚪</span> تسجيل الخروج
				</button>
			</div>
		</header>
	);
}
