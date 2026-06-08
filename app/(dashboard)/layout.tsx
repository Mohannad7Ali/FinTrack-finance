// app/(dashboard)/layout.tsx (أو المسار الذي تستخدمه)
'use client';

import { useState, useCallback } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { BottomNavBar } from './BottomNavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleLogout = useCallback(async () => {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}, []);

	const handleMenuClick = useCallback(() => {
		setIsSidebarOpen(true);
	}, []);

	const handleCloseSidebar = useCallback(() => {
		setIsSidebarOpen(false);
	}, []);

	return (
		<div className="min-h-screen bg-slate-950 text-white font-sans antialiased flex flex-col overflow-x-hidden w-full">
			<div className="flex flex-1">
				<DashboardSidebar
					isOpen={isSidebarOpen}
					onClose={handleCloseSidebar}
					onLogout={handleLogout}
				/>
				<div className="flex flex-col flex-1 lg:mr-75">
					<div className="p-4 md:p-6">
						<DashboardHeader
							month={month}
							year={year}
							onLogout={handleLogout}
							onMenuClick={handleMenuClick}
						/>
					</div>
					<main className="flex-1 px-4 md:px-6 pb-20 md:pb-6">{children}</main>

					{/* تذييل عادي يظهر فقط على الشاشات الكبيرة */}
					<footer className="hidden md:block border-t border-white/10 mt-6 pt-4 pb-4 text-center">
						<p className="text-[11px] md:text-xs text-slate-500 flex items-center justify-center gap-1 flex-wrap">
							<a
								href="https://mohannad-ali-portfolio.vercel.app/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-emerald-400 hover:text-emerald-300 transition underline decoration-emerald-400/30 hover:decoration-emerald-400/80"
							>
								Mohannad Ali
							</a>
							<span>Made with ❤ By</span>
						</p>
						<p className="text-[10px] md:text-xs text-slate-500 mt-1">
							© {new Date().getFullYear()} FinTrack. All rights reserved.
						</p>
					</footer>
				</div>
			</div>

			{/* شريط التنقل السفلي يظهر فقط على الموبايل */}
			<BottomNavBar />
		</div>
	);
}
