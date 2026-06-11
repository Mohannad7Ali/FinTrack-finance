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
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: 'easeOut' }}
			dir="rtl"
			className="relative w-full overflow-hidden flex flex-col 
                 bg-gradient-to-r from-emerald-900/30 via-slate-800/70 to-emerald-900/30 
                 backdrop-blur-3xl rounded-[2.75rem] 
                 border border-white/10 shadow-2xl group"
		>
			{/* تأثيرات الـ Glow المستوحاة من الهيرو */}
			<div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl -z-0" />
			<div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-500/8 rounded-full filter blur-3xl -z-0" />

			{/* Glint Effect ناعم */}
			<div className="absolute inset-0 w-[180%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[glint_1.3s_ease-in-out] pointer-events-none" />

			<style jsx>{`
				@keyframes glint {
					0% {
						transform: translateX(-180%) skewX(-12deg);
					}
					100% {
						transform: translateX(180%) skewX(-12deg);
					}
				}
			`}</style>

			<div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 p-6 md:px-10 md:py-7">
				{/* الجانب الأيمن */}
				<div className="flex items-center gap-5 w-full sm:w-auto">
					<motion.button
						whileTap={{ scale: 0.9 }}
						onClick={onMenuClick}
						className="lg:hidden p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 text-emerald-400 transition-all"
					>
						<Menu size={20} />
					</motion.button>

					<div className="flex flex-col">
						<div className="flex items-center gap-3">
							<LogoName />
							<span className="text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-3.5 py-1 rounded-full border border-emerald-500/20">
								{month.toString().padStart(2, '0')}/{year}
							</span>
						</div>

						<h1 className="text-xl md:text-2xl font-bold text-white mt-2 flex items-center gap-3">
							<span className="opacity-80">{greeting}،</span>
							<span className="bg-gradient-to-l from-white via-emerald-300 to-emerald-200 bg-clip-text text-transparent font-black">
								{userData?.name?.split(' ')[0] || 'مستخدم'}
							</span>
							<Sparkles size={18} className="text-amber-300" />
						</h1>
					</div>
				</div>

				{/* التاريخ */}
				<div className="hidden md:flex flex-col items-center opacity-70">
					<span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
						اليوم
					</span>
					<span className="text-sm font-semibold text-white/90">
						{currentDayName} {currentDayNumber} {currentMonthName}
					</span>
				</div>

				{/* الجانب الأيسر */}
				<div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
					{/* Weather Card */}
					<motion.div
						whileHover={{ scale: 1.03 }}
						className="flex items-center gap-3.5 bg-slate-900/60 backdrop-blur-xl rounded-3xl px-6 py-3.5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all group/weather cursor-pointer"
						onClick={() => !weatherLoading && refetch()}
					>
						{weatherLoading || isLocating ? (
							<RefreshCw size={24} className="animate-spin text-emerald-400" />
						) : weather ? (
							<>
								<span className="text-4xl drop-shadow-lg group-hover/weather:scale-110 transition-transform">
									{weather.conditionIcon}
								</span>
								<div>
									<div className="text-[28px] font-bold text-white leading-none">
										{weather.temp}°C
									</div>
									<div className="text-xs text-emerald-400/80 flex items-center gap-1 mt-0.5">
										<MapPin size={13} /> سوريا
									</div>
								</div>
							</>
						) : (
							<RefreshCw
								size={24}
								onClick={refetch}
								className="text-slate-400 hover:text-emerald-400 cursor-pointer"
							/>
						)}
					</motion.div>

					{/* Avatar */}
					<div className="relative group" ref={menuRef}>
						<motion.div
							whileHover={{ scale: 1.07 }}
							whileTap={{ scale: 0.96 }}
							className="p-[3px] rounded-full bg-gradient-to-tr from-emerald-500/70 to-cyan-400/60 cursor-pointer shadow-lg shadow-emerald-500/20"
							onClick={() => setOpen(!open)}
						>
							<div className="bg-slate-900 rounded-full p-0.5 border border-white/10">
								<Image
									src={userData?.image || '/images/avatar.png'}
									alt="User"
									width={46}
									height={46}
									className="w-[46px] h-[46px] rounded-full object-cover"
								/>
							</div>
						</motion.div>

						<AnimatePresence>
							{open && (
								<motion.div
									initial={{ opacity: 0, y: 12, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 12, scale: 0.95 }}
									className="absolute left-0 top-full mt-4 w-56 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl py-2 z-50"
								>
									<button
										onClick={onLogout}
										className="w-full flex items-center gap-3 px-6 py-3 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all rounded-2xl"
									>
										تسجيل الخروج
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			{/* Currency Ticker - متسق مع الهيرو */}
			<div className="relative z-10 border-t border-white/10 bg-white/[0.02] py-3.5 px-8">
				<div className="flex items-center gap-8 overflow-x-auto no-scrollbar justify-center sm:justify-start">
					<div className="flex items-center gap-3 shrink-0">
						<div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgb(52,211,153)]" />
						<span className="text-xs font-bold text-slate-300">USD</span>
						<div className="font-mono text-base">
							<span className="text-white font-semibold">{formatPrice(usdToSyp)}</span>
							<span className="text-slate-600 mx-2">•</span>
							<span className="text-emerald-400/90 text-sm">{formatPrice(usdToSyp * 100)}</span>
						</div>
					</div>

					<div className="flex items-center gap-3 shrink-0">
						<div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgb(103,232,249)]" />
						<span className="text-xs font-bold text-slate-300">EUR</span>
						<div className="font-mono text-base">
							<span className="text-white font-semibold">{formatPrice(eurToSyp)}</span>
							<span className="text-slate-600 mx-2">•</span>
							<span className="text-emerald-400/90 text-sm">{formatPrice(eurToSyp * 100)}</span>
						</div>
					</div>

					<div className="hidden sm:flex items-center gap-2 ml-auto opacity-50">
						<TrendingUp size={15} className="text-emerald-400" />
						<span className="text-[10px] font-black uppercase tracking-widest">السوق نشط</span>
					</div>
				</div>
			</div>
		</motion.header>
	);
}

export const DashboardHeader = memo(DashboardHeaderComponent);
