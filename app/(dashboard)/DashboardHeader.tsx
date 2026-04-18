'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Menu, LogOut, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { weekdaysAr, monthNamesAr } from '@/lib/constants/date.constant';
import { useWeather } from '@/hooks/useWeather';
import { useME } from '@/hooks/useMe';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import Image from 'next/image';
import { LogoName } from '@/components/common/LogoName';
import { createPortal } from 'react-dom';

interface Props {
	month: number;
	year: number;
	onLogout: () => void;
	onMenuClick: () => void;
}

function DashboardHeaderComponent({ month, year, onLogout, onMenuClick }: Props) {
	const {
		weather,
		isLoading: weatherLoading,
		error: weatherError,
		refetch,
		isLocating,
	} = useWeather();
	const { data: userData } = useME();
	const { convert, isLoading: ratesLoading, isError: ratesError } = useExchangeRates();

	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
	if (typeof window != undefined) {
		setMounted(true);
	}
	// حساب موضع القائمة بدقة لمنع الخروج عن الشاشة (Responsive Fix)
	useEffect(() => {
		if (open && menuRef.current) {
			const rect = menuRef.current.getBoundingClientRect();
			const menuWidth = 224; // عرض w-56
			const screenWidth = window.innerWidth;
			const padding = 12;

			// حساب الموضع الافتراضي (محاذاة يمين القائمة مع يمين الأيقونة)
			let calculatedRight = screenWidth - rect.right;

			// منع القائمة من الخروج من جهة اليسار (Critical for Mobile)
			if (calculatedRight + menuWidth > screenWidth) {
				calculatedRight = screenWidth - menuWidth - padding;
			}

			// منع القائمة من الخروج من جهة اليمين
			if (calculatedRight < padding) {
				calculatedRight = padding;
			}

			setDropdownPosition({
				top: rect.bottom + 8,
				right: calculatedRight,
			});
		}
	}, [open]);

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

	const usdToSyp = convert(1, 'USD', 'SYP');
	const eurToSyp = convert(1, 'EUR', 'SYP');

	const formatPrice = (value: number) =>
		value > 0 ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '---';

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
			className="relative w-full max-w-full overflow-hidden flex flex-col gap-0 bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl"
		>
			<div className="absolute inset-0 bg-linear-to-br from-indigo-500/25 via-transparent to-purple-500/25 pointer-events-none" />

			<div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-5 md:p-6">
				{/* القسم الأيمن: الشعار والعنوان */}
				<div className="flex flex-col gap-3 w-full md:w-auto">
					<div className="flex items-center justify-between md:justify-start gap-3">
						<button
							onClick={onMenuClick}
							className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
							aria-label="فتح القائمة"
						>
							<Menu size={22} className="text-white" />
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

				{/* القسم الأيسر: الطقس والمستخدم */}
				<div className="flex items-center justify-between md:justify-end gap-4">
					<div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 min-w-[130px]">
						{weatherLoading || isLocating ? (
							<div className="flex items-center gap-2 text-slate-400 text-sm">
								<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
								<span className="whitespace-nowrap">تحديث...</span>
							</div>
						) : weatherError ? (
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
									<span className="text-sm font-bold text-white whitespace-nowrap">
										{weather.temp}°C {weather.condition}
									</span>
									<div className="flex items-center gap-1 text-[10px] text-slate-400">
										<MapPin size={10} />
										<span className="truncate max-w-[80px]">{weather.location}</span>
									</div>
								</div>
							</>
						) : (
							<div className="text-xs text-slate-500 flex items-center gap-1">
								<AlertCircle size={14} />
								لا بيانات
							</div>
						)}
					</div>

					<div className="relative flex-shrink-0" ref={menuRef}>
						<Image
							src={userData?.image || '/images/avatar.png'}
							alt="User"
							width={44}
							height={44}
							priority
							className="w-11 h-11 rounded-full object-cover border-2 border-white/20 cursor-pointer hover:border-indigo-400 transition"
							onClick={() => setOpen(!open)}
						/>
						{open &&
							mounted &&
							createPortal(
								<div
									className="fixed w-56 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
									style={{
										top: dropdownPosition.top,
										right: dropdownPosition.right,
										pointerEvents: 'auto',
									}}
								>
									<div className="px-4 py-3 border-b border-white/10">
										<p className="text-sm font-semibold text-white">{userData?.name || 'مستخدم'}</p>
										<p className="text-xs text-slate-400 truncate">{userData?.email || ''}</p>
									</div>
									<button
										onClick={onLogout}
										className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
									>
										<LogOut size={16} />
										تسجيل الخروج
									</button>
								</div>,
								document.body
							)}
					</div>
				</div>
			</div>

			{/* شريط أسعار الصرف */}
			<div className="relative z-10 w-full border-t border-white/10 bg-black/20 backdrop-blur-sm py-2 px-5 md:px-6">
				<div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
					<div className="flex items-center gap-2 flex-shrink-0">
						<span className="text-[14px] font-bold text-slate-200 uppercase tracking-wider">
							USD
						</span>
						<span
							className={`text-sm font-mono font-semibold ${ratesLoading ? 'animate-pulse text-slate-600' : 'text-emerald-400'}`}
						>
							{formatPrice(usdToSyp)} | {formatPrice(usdToSyp * 100)}
						</span>
					</div>
					<div className="w-px h-4 bg-white/10 flex-shrink-0" />
					<div className="flex items-center gap-2 flex-shrink-0">
						<span className="text-[14px] font-bold text-slate-200 uppercase tracking-wider">
							EUR
						</span>
						<span
							className={`text-sm font-mono font-semibold ${ratesLoading ? 'animate-pulse text-slate-600' : 'text-blue-400'}`}
						>
							{formatPrice(eurToSyp)} | {formatPrice(eurToSyp * 100)}
						</span>
					</div>
					<div className="font-semibold font-mono text-xs text-slate-400 flex-shrink-0">ل.س</div>
					{ratesError && (
						<div className="mr-auto text-[10px] text-red-500/80 whitespace-nowrap animate-pulse">
							⚠️ خطأ في التحديث
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export const DashboardHeader = memo(DashboardHeaderComponent);
