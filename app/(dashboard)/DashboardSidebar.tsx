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
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useME } from '@/hooks/useMe';
import Image from 'next/image';
import { LogoName } from '@/components/common/LogoName';

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
}

const menuItems = [
	{ title: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
	{ title: 'الفئات', href: '/categories', icon: FolderKanban },
	{ title: 'المحافظ', href: '/wallets', icon: Wallet },
	{ title: 'المعاملات', href: '/transactions', icon: ArrowLeftRight },
	{ title: 'التقارير', href: '/reports', icon: BarChart3 },
	{ title: 'الإعدادات', href: '/settings', icon: Settings },
];

export function DashboardSidebar({ isOpen, onClose, onLogout }: SidebarProps) {
	const pathname = usePathname();
	const { data: user } = useME();

	return (
		<>
			{/* Overlay للموبايل */}
			<div
				className={cn(
					'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300',
					isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
				)}
				onClick={onClose}
			/>

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed top-0 right-0 h-full w-72 bg-slate-900/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50',
					'transform transition-transform duration-300 ease-out',
					isOpen ? 'translate-x-0' : 'translate-x-full',
					'lg:translate-x-0'
				)}
			>
				<button
					onClick={onClose}
					className="absolute top-3 left-3 lg:hidden text-slate-400 hover:text-white transition"
				>
					<X size={22} />
				</button>
				{/* Header */}
				<div className="flex flex-col justify-center items-center pt-8">
					<LogoName />
					<div className="p-6 border-b border-white/10 flex items-center justify-between">
						<h2 className="text-xl font-bold bg-linear-to-l from-indigo-400 to-purple-400 bg-clip-text text-transparent">
							FinTrack
						</h2>
					</div>
				</div>

				{/* User Info */}
				<div className="p-5 border-b border-white/10 flex flex-col items-center justify-center gap-3">
					<Image
						alt="صورة المستخدم"
						width={48}
						height={48}
						className="w-12 h-12 rounded-full object-cover ring-3 ring-green-500"
						src={user?.image || '/images/avatar.png'}
					/>
					<div className="flex flex-col gap-0.5 items-center justify-center">
						<p className="font-semibold text-white">{user?.name || 'مستخدم'}</p>
						<p className="font-extralight text-sm text-slate-400">{user?.email || ''}</p>
					</div>
				</div>

				{/* Navigation */}
				<nav className="p-4 space-y-1.5">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={onClose}
								className={cn(
									'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200',
									isActive
										? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
										: 'text-slate-300 hover:bg-white/5 hover:text-white'
								)}
							>
								<Icon size={18} />
								<span>{item.title}</span>
								{isActive && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
							</Link>
						);
					})}
				</nav>
				<button
					onClick={onLogout}
					className="w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer text-red-400 hover:bg-red-500/10 transition"
				>
					<LogOut size={16} />
					تسجيل الخروج
				</button>
			</aside>
		</>
	);
}
