'use client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}
	return (
		<html lang="ar" dir="rtl">
			<body className="font-sans">
				<DashboardHeader month={month} year={year} onLogout={handleLogout} />

				{children}
			</body>
		</html>
	);
}
