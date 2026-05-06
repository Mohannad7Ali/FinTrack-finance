'use client';

import { useME } from '@/hooks/useMe';
import { ReportSummary } from '@/types/reports';

export default function SummaryCards({ summary }: { summary: ReportSummary }) {
	const { income, expense, balance } = summary;
	const { data, isLoading: userLoading } = useME();
	const currency = data?.preferredCurrency || 'SYP';

	if (userLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="rounded-xl sm:rounded-2xl bg-slate-800/50 p-4 sm:p-5 animate-pulse"
					>
						<div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
						<div className="h-8 bg-slate-700 rounded w-32"></div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
			<div className="rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-900/50 p-4 sm:p-5">
				<p className="text-slate-300 text-xs sm:text-sm">إجمالي الدخل</p>
				<p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 mt-1 sm:mt-2">
					{income.toLocaleString()} {currency}
				</p>
			</div>
			<div className="rounded-xl sm:rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-slate-900/50 p-4 sm:p-5">
				<p className="text-slate-300 text-xs sm:text-sm">إجمالي المصروفات</p>
				<p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 mt-1 sm:mt-2">
					{expense.toLocaleString()} {currency}
				</p>
			</div>
			<div className="rounded-xl sm:rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-slate-900/50 p-4 sm:p-5">
				<p className="text-slate-300 text-xs sm:text-sm">صافي الربح / الخسارة</p>
				<p
					className={`text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 ${balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}
				>
					{balance.toLocaleString()} {currency}
				</p>
			</div>
		</div>
	);
}
