'use client';
import Link from 'next/link';
type Props = {
	month: number;
	year: number;
	onLogout: () => void;
};
export function DashboardHeader({ month, year, onLogout }: Props) {
	return (
		<header className="w-full flex flex-col md:flex-row md:justify-between ">
			<h1 className="text-3xl font-semibold text-white">
				لوحة التحكم - {month.toString().padStart(2, '0')}/{year}
			</h1>
			<p className="text-sm text-slate-400">نظرة عامة على وضعك المالي لهذا الشهر.</p>
			<div className="flex items-center gap-3">
				<Link href="/categories" className="px-3 py-1.5 rounded-xl border border-white/10">
					إدارة الفئات
				</Link>
				<button
					onClick={onLogout}
					className="px-3 py-1.5 rounded-xl border border-red-500/40 text-red-300"
				>
					تسجيل الخروج
				</button>
			</div>
		</header>
	);
}
