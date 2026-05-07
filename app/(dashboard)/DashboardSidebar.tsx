'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	X,
	LayoutDashboard,
	FolderKanban,
	Wallet,
	ArrowLeftRight,
	BarChart3,
	Settings,
	LogOut,
	Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useME } from '@/hooks/useMe';
import Image from 'next/image';
import { LogoName } from '@/components/common/LogoName';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardSidebar({ isOpen, onClose, onLogout }: any) {
	const pathname = usePathname();
	const { data: user } = useME();

	return (
		<>
			{/* Overlay (Mobile Only) */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-indigo-950/20 backdrop-blur-md z-40 lg:hidden"
						onClick={onClose}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar Container */}
			<aside
				className={cn(
					'fixed top-0 right-0 h-screen z-50 bg-slate-900/60 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden',
					// العرض: كبير في الموبايل، ونحيف وأنيق في الديسكتوب
					'w-[280px] lg:w-64',
					isOpen ? 'translate-x-0' : 'translate-x-full',
					'lg:translate-x-0'
				)}
			>
				{/* خلفية سحرية خفيفة جداً */}
				<div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/5 blur-[60px] pointer-events-none" />

				{/* Close Button (Mobile) */}
				<button
					onClick={onClose}
					className="absolute top-4 left-4 lg:hidden p-2 rounded-xl bg-white/5 text-white/50 border border-white/10 z-30"
				>
					<X size={18} />
				</button>

				{/* 1. Header Area - أصغر في الديسكتوب */}
				<div className="relative flex-none pt-8 lg:pt-6 pb-6 flex flex-col items-center">
					<div className="scale-90 lg:scale-75 origin-center transition-transform">
						<LogoName />
					</div>
					<h2 className="mt-2 text-xl lg:text-lg font-black tracking-widest bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent opacity-90">
						FinTrack
					</h2>
				</div>

				{/* 2. User Card - نسخة مضغوطة جداً (Compact) */}
				<div className="relative flex-none mx-5 lg:mx-4 mb-6 lg:mb-4 p-3 lg:p-2.5 rounded-2xl lg:rounded-xl bg-white/5 border border-white/10 group transition-all">
					<div className="relative flex items-center lg:flex-row flex-col gap-3 lg:gap-2">
						<div className="relative shrink-0">
							<Image
								alt="avatar"
								width={44}
								height={44}
								className="w-11 h-11 lg:w-9 lg:h-9 rounded-full border border-white/20 p-0.5 object-cover"
								src={user?.image || '/images/avatar.png'}
							/>
							<div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
						</div>
						<div className="text-center lg:text-right overflow-hidden">
							<p className="font-bold text-white text-sm lg:text-xs truncate tracking-tight">
								{user?.name || 'مستخدم'}
							</p>
							<span className="text-[9px] lg:text-[8px] text-indigo-300/70 font-bold uppercase">
								Pro Member
							</span>
						</div>
					</div>
				</div>

				{/* 3. Navigation Area - مسافات عمودية أقل لضمان عدم وجود سكرول */}
				<nav className="flex-1 px-3 lg:px-2.5 py-1 space-y-1 overflow-y-auto no-scrollbar">
					{[
						{ title: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
						{ title: 'الفئات', href: '/categories', icon: FolderKanban },
						{ title: 'المحافظ', href: '/wallets', icon: Wallet },
						{ title: 'المعاملات', href: '/transactions', icon: ArrowLeftRight },
						{ title: 'التقارير', href: '/reports', icon: BarChart3 },
						{ title: 'الإعدادات', href: '/settings', icon: Settings },
					].map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={onClose}
								className={cn(
									'group relative flex items-center gap-3 px-4 lg:px-3 py-2.5 lg:py-2 rounded-xl lg:rounded-lg text-sm lg:text-[13px] font-semibold transition-all duration-300',
									isActive
										? 'bg-indigo-500/10 text-white border border-white/5'
										: 'text-slate-400 hover:text-white hover:bg-white/5'
								)}
							>
								<Icon
									size={18}
									className={cn(
										'transition-colors',
										isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
									)}
								/>
								<span>{item.title}</span>

								{isActive && (
									<motion.div
										layoutId="activeTab"
										className="absolute left-1.5 w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
									/>
								)}
							</Link>
						);
					})}
				</nav>

				{/* 4. Footer Area - ثابت في الأسفل وبحجم أصغر */}
				<div className="flex-none p-4 lg:p-3 border-t border-white/5 bg-black/10">
					<button
						onClick={onLogout}
						className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold transition-all border border-rose-500/10"
					>
						<LogOut size={14} />
						تسجيل الخروج
					</button>
					<p className="text-[8px] text-center text-slate-600 mt-2 font-mono uppercase tracking-widest opacity-50">
						v1.0.4 • Stable
					</p>
				</div>
			</aside>
		</>
	);
}
