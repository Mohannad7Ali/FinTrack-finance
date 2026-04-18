'use client';

import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}

	return (
		<div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
			<div className="flex justify-between">
				<DashboardSidebar
					isOpen={isSidebarOpen}
					onClose={() => setIsSidebarOpen(false)}
					onLogout={handleLogout}
				/>
				<div className="flex flex-col flex-1 lg:mr-75">
					<div className="p-4 md:p-6">
						<DashboardHeader
							month={month}
							year={year}
							onLogout={handleLogout}
							onMenuClick={() => setIsSidebarOpen(true)}
						/>
					</div>
					<main className="flex-1 px-4 md:px-6 pb-6">{children}</main>
				</div>
			</div>
		</div>
	);
}
