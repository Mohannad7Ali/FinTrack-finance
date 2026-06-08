// components/layout/BottomNavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	LayoutDashboard,
	FolderKanban,
	Wallet,
	ArrowLeftRight,
	BarChart3,
	Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

const navItems = [
	{ title: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
	{ title: 'الفئات', href: '/categories', icon: FolderKanban },
	{ title: 'المحافظ', href: '/wallets', icon: Wallet },
	{ title: 'المعاملات', href: '/transactions', icon: ArrowLeftRight },
	{ title: 'التقارير', href: '/reports', icon: BarChart3 },
	{ title: 'الإعدادات', href: '/settings', icon: Settings },
];

export function BottomNavBar() {
	const pathname = usePathname();

	return (
		<div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
			{/* شريط خلفي مع تأثير الزجاج */}
			<div className="bg-slate-900/90 backdrop-blur-xl border-t border-white/10 shadow-2xl">
				<div className="flex justify-around items-center py-2 px-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px]',
									isActive
										? 'text-emerald-400'
										: 'text-slate-500 hover:text-slate-300 active:scale-95'
								)}
							>
								<Icon size={22} strokeWidth={1.8} />
								<span className="text-[10px] font-medium">{item.title}</span>
								{isActive && (
									<motion.div
										layoutId="bottomNavIndicator"
										className="absolute -top-1 w-6 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									/>
								)}
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
