'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Menu, LogOut, RefreshCw, MapPin, AlertCircle } from 'lucide-react'; // تم إزالة User
import { weekdaysAr, monthNamesAr } from '@/lib/constants/date.constant';
import { useWeather } from '@/hooks/useWeather';
import { useME } from '@/hooks/useMe';
import Image from 'next/image';
import { LogoName } from '@/components/common/LogoName';

interface Props {
	month: number;
	year: number;
	onLogout: () => void;
	onMenuClick: () => void;
}

function DashboardHeaderComponent({ month, year, onLogout, onMenuClick }: Props) {
	const { weather, isLoading, error, refetch, isLocating } = useWeather();
	const { data: userData } = useME();

	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const today = new Date();
	const currentDayName = weekdaysAr[today.getDay()];
	const currentDayNumber = today.getDate();
	const currentMonthName = monthNamesAr[today.getMonth()];
	const currentFullYear = today.getFullYear();

	const hours = today.getHours();
	let greeting = '';
	if (hours < 12) greeting = 'صباح الخير ';
	else if (hours < 20) greeting = ' أهلاً بك ';
	else greeting = 'مساء الخير 🌙';

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	return (
		<header
			dir="rtl"
			className="relative w-full flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-5 md:p-6 bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/25 via-transparent to-purple-500/25 pointer-events-none" />

			<div className="flex flex-col gap-3 z-10 w-full md:w-auto">
				<div className="flex items-center justify-between md:justify-start gap-3">
					<button
						onClick={onMenuClick}
						className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
						aria-label="فتح القائمة"
					>
						<Menu size={22} />
					</button>
					<LogoName />
				</div>

				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
						<span className="bg-white/10 p-2 rounded-xl">📊</span>
						لوحة التحكم
						<span className="text-slate-400 text-lg md:text-xl font-light">
							— {month.toString().padStart(2, '0')}/{year}
						</span>
					</h1>

					<div className="mt-3 space-y-1">
						<p className="text-slate-200 text-base md:text-lg">
							{greeting}{' '}
							<span className="text-transparent bg-clip-text bg-linear-to-l from-indigo-400 to-purple-400 font-semibold">
								{userData?.name || 'مستخدمنا العزيز'}
							</span>
							✨
						</p>
						<p className="text-sm text-slate-400 flex items-center gap-2">
							<span>📅</span>
							اليوم {currentDayName}، {currentDayNumber} {currentMonthName} {currentFullYear}
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between md:justify-end gap-4 z-10">
				{/* بطاقة الطقس */}
				<div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 min-w-[130px]">
					{isLoading || isLocating ? (
						<div className="flex items-center gap-2 text-slate-400 text-sm">
							<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							<span>جاري تحديث الأجواء...</span>
						</div>
					) : error ? (
						<button
							onClick={() => refetch()}
							className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition"
						>
							<RefreshCw size={14} />
							إعادة المحاولة
						</button>
					) : weather ? (
						<>
							<span className="text-3xl drop-shadow-md">{weather.conditionIcon || '🌡️'}</span>
							<div className="flex flex-col leading-tight">
								<span className="text-sm font-bold text-white">
									{weather.temp}°C {weather.condition}
								</span>
								<div className="flex items-center gap-1 text-[10px] text-slate-400">
									<MapPin size={10} />
									<span>{weather.location}</span>
								</div>
							</div>
						</>
					) : (
						<div className="text-xs text-slate-500 flex items-center gap-1">
							<AlertCircle size={14} />
							لا توجد بيانات
						</div>
					)}
				</div>

				{/* قائمة المستخدم - تم إزالة زر "الملف الشخصي" */}
				<div className="relative" ref={menuRef}>
					<Image
						src={userData?.image || '/images/avatar.png'}
						alt="صورة المستخدم"
						width={44}
						height={44}
						priority
						className="w-11 h-11 rounded-full object-cover border-2 border-white/20 cursor-pointer hover:border-indigo-400 transition"
						onClick={() => setOpen(!open)}
					/>
					{open && (
						<div
							className="absolute left-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
							style={{ pointerEvents: 'auto' }} // تأكيد التقاط النقرات
						>
							<div className="px-4 py-3 border-b border-white/10">
								<p className="text-sm font-semibold text-white">{userData?.name || 'مستخدم'}</p>
								<p className="text-xs text-slate-400 truncate">{userData?.email || ''}</p>
							</div>
							{/* تم حذف زر "الملف الشخصي" نهائياً */}
							<button
								onClick={onLogout}
								className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
							>
								<LogOut size={16} />
								تسجيل الخروج
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export const DashboardHeader = memo(DashboardHeaderComponent);
