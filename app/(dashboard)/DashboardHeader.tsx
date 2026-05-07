'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Menu, RefreshCw, MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { weekdaysAr, monthNamesAr } from '@/lib/constants/date.constant';
import { useWeather } from '@/hooks/useWeather';
import { useME } from '@/hooks/useMe';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import Image from 'next/image';
import { LogoName } from '@/components/common/LogoName';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
	month: number;
	year: number;
	onLogout: () => void;
	onMenuClick: () => void;
}

function DashboardHeaderComponent({ month, year, onLogout, onMenuClick }: Props) {
	const { weather, isLoading: weatherLoading, refetch, isLocating } = useWeather();
	const { data: userData } = useME();
	const { convert } = useExchangeRates();

	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const today = new Date();
	const currentDayName = weekdaysAr[today.getDay()];
	const currentDayNumber = today.getDate();
	const currentMonthName = monthNamesAr[today.getMonth()];
	const currentFullYear = today.getFullYear();

	const hours = today.getHours();
	const greeting = hours < 12 ? 'صباح الخير' : hours < 20 ? 'أهلاً بك' : 'مساء الخير';

	const usdToSyp = convert(1, 'USD', 'SYP');
	const eurToSyp = convert(1, 'EUR', 'SYP');

	const formatPrice = (value: number) =>
		value > 0 ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '---';

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<motion.header
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			dir="rtl"
			className="relative w-full overflow-hidden flex flex-col bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl ring-1 ring-white/5 group"
		>
			{/* ومضة زجاجية سريعة (The Glint Effect) بدل الـ Shimmer القديم */}
			<div className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[glint_0.8s_ease-in-out] pointer-events-none" />

			<style jsx>{`
				@keyframes glint {
					0% {
						transform: translateX(-150%) skewX(-12deg);
					}
					100% {
						transform: translateX(150%) skewX(-12deg);
					}
				}
			`}</style>

			{/* إضاءة خلفية خافتة جداً لزيادة العمق */}
			<div className="absolute top-[-10%] left-[20%] w-1/2 h-1/2 bg-emerald-500/5 blur-[100px] pointer-events-none" />

			<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 md:px-8 md:py-5">
				{/* القسم الأيمن: الشعار والترحيب */}
				<div className="flex items-center gap-4 w-full sm:w-auto">
					<motion.button
						whileTap={{ scale: 0.9 }}
						onClick={onMenuClick}
						className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400"
					>
						<Menu size={18} />
					</motion.button>

					<div className="flex flex-col">
						<div className="flex items-center gap-2 scale-90 origin-right">
							<LogoName />
							<span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400/70 px-2 py-0.5 rounded-full border border-emerald-500/20">
								{month.toString().padStart(2, '0')}/{year}
							</span>
						</div>
						<h1 className="text-base md:text-lg font-bold text-white mt-1 flex items-center gap-2">
							<span className="opacity-70 font-medium">{greeting}،</span>
							<span className="bg-gradient-to-l from-white via-emerald-200 to-sky-300 bg-clip-text text-transparent font-black">
								{userData?.name?.split(' ')[0] || 'مستخدم'}
							</span>
							<Sparkles size={14} className="text-amber-400 animate-pulse" />
						</h1>
					</div>
				</div>

				{/* القسم الأوسط: التاريخ (مخفي في الشاشات الصغيرة جداً) */}
				<div className="hidden md:flex flex-col items-center opacity-40">
					<span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
						Current Date
					</span>
					<span className="text-xs font-bold text-white">
						{currentDayName} {currentDayNumber} {currentMonthName}
					</span>
				</div>

				{/* القسم الأيسر: الطقس والمستخدم */}
				<div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
					{/* الطقس بنسخة أنيقة جداً */}
					<div className="flex items-center gap-2.5 bg-black/20 rounded-2xl px-3 py-1.5 border border-white/5 group/weather hover:border-emerald-500/30 transition-all">
						{weatherLoading || isLocating ? (
							<RefreshCw size={14} className="animate-spin text-emerald-500/50" />
						) : weather ? (
							<>
								<span className="text-xl drop-shadow-sm group-hover/weather:scale-110 transition-transform">
									{weather.conditionIcon}
								</span>
								<div className="flex flex-col">
									<span className="text-xs font-black text-white">{weather.temp}°C</span>
									<span className="text-[9px] text-slate-500 font-bold flex items-center gap-0.5">
										<MapPin size={8} /> Syria
									</span>
								</div>
							</>
						) : (
							<RefreshCw
								onClick={() => refetch()}
								size={14}
								className="text-slate-500 cursor-pointer"
							/>
						)}
					</div>

					{/* الصورة الشخصية */}
					<div className="relative group shrink-0" ref={menuRef}>
						<motion.div
							whileHover={{ scale: 1.05 }}
							className="p-[2px] rounded-full bg-gradient-to-tr from-emerald-500/40 to-sky-500/40 border border-white/20 cursor-pointer"
							onClick={() => setOpen(!open)}
						>
							<Image
								src={userData?.image || '/images/avatar.png'}
								alt="User"
								width={36}
								height={36}
								className="w-9 h-9 rounded-full object-cover border border-slate-900 shadow-xl"
							/>
						</motion.div>

						<AnimatePresence>
							{open && (
								<motion.div
									initial={{ opacity: 0, y: 10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 10, scale: 0.95 }}
									className="absolute left-0 top-full mt-3 w-48 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 py-1"
								>
									<button
										onClick={onLogout}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-all text-right"
									>
										تسجيل الخروج
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			{/* شريط العملات (Sleek Ticker) */}
			<div className="relative z-10 w-full border-t border-white/5 bg-white/[0.02] py-2 px-6">
				<div className="flex items-center gap-8 overflow-x-auto no-scrollbar justify-center sm:justify-start">
					{/* USD */}
					<div className="flex items-center gap-2.5 shrink-0">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
						<span className="text-[10px] font-black text-slate-400">USD</span>
						<div className="flex items-center gap-2 font-mono">
							<span className="text-xs font-bold text-white/90">{formatPrice(usdToSyp)}</span>
							<span className="text-[10px] text-slate-600">|</span>
							<span className="text-[10px] text-slate-500">{formatPrice(usdToSyp * 100)}</span>
						</div>
					</div>

					{/* EUR */}
					<div className="flex items-center gap-2.5 shrink-0">
						<div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
						<span className="text-[10px] font-black text-slate-400">EUR</span>
						<div className="flex items-center gap-2 font-mono">
							<span className="text-xs font-bold text-white/90">{formatPrice(eurToSyp)}</span>
							<span className="text-[10px] text-slate-600">|</span>
							<span className="text-[10px] text-slate-500">{formatPrice(eurToSyp * 100)}</span>
						</div>
					</div>

					<div className="hidden sm:flex items-center gap-1.5 mr-auto opacity-20">
						<TrendingUp size={10} className="text-emerald-400" />
						<span className="text-[8px] font-black uppercase tracking-widest text-white">
							Market Active
						</span>
					</div>
				</div>
			</div>
		</motion.header>
	);
}

export const DashboardHeader = memo(DashboardHeaderComponent);
