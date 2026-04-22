// components/LoadingScreen.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface LoadingScreenProps {
	isLoading: boolean;
	minDisplayTime?: number; // minimum time to show loader (ms)
}

export function LoadingScreen({ isLoading, minDisplayTime = 800 }: LoadingScreenProps) {
	const [isVisible, setIsVisible] = useState(isLoading);
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (isLoading) {
			// إلغاء أي مؤقت سابق
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
				hideTimeoutRef.current = null;
			}
			// إظهار الشاشة فوراً
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsVisible(true);
		} else {
			// عند انتهاء التحميل، انتظر المدة المحددة ثم أخفِ الشاشة
			hideTimeoutRef.current = setTimeout(() => {
				setIsVisible(false);
			}, minDisplayTime);
		}
		// تنظيف المؤقت عند إلغاء تحميل المكون أو تغيير التبعيات
		return () => {
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
		};
	}, [isLoading, minDisplayTime]);

	if (!isVisible) return null;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }}
				transition={{ duration: 0.3 }}
			>
				{/* خلفية متحركة */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" />
				</div>

				{/* المحتوى الأساسي */}
				<div className="relative z-10 text-center space-y-8">
					{/* شعار متحرك */}
					<motion.div
						className="relative w-24 h-24 mx-auto"
						animate={{ rotate: 360 }}
						transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
					>
						<div
							className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse"
							style={{ filter: 'blur(12px)' }}
						/>
						<div className="relative flex items-center justify-center w-full h-full rounded-full bg-slate-900/80 backdrop-blur-sm border border-white/10">
							<svg
								className="w-12 h-12 text-emerald-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
					</motion.div>

					{/* اسم التطبيق */}
					<div className="space-y-2">
						<motion.h1
							className="text-3xl md:text-4xl font-bold text-white tracking-tight"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}
						>
							FinTrack
						</motion.h1>
						<motion.p
							className="text-sm text-slate-400"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4, duration: 0.6 }}
						>
							منصة التحكم المالي الذكية
						</motion.p>
					</div>

					{/* شريط تحميل متحرك */}
					<motion.div
						className="w-48 sm:w-64 h-1 bg-slate-800 rounded-full overflow-hidden"
						initial={{ opacity: 0, scaleX: 0.8 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ delay: 0.5, duration: 0.4 }}
					>
						<motion.div
							className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"
							animate={{ x: ['-100%', '100%'] }}
							transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
						/>
					</motion.div>

					{/* نص تحميل */}
					<motion.p
						className="text-[11px] text-slate-500 font-mono"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7 }}
					>
						جاري تحميل البيئة الآمنة...
					</motion.p>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
