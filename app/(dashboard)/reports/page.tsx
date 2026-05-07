// app/(dashboard)/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useReports } from '@/hooks/useReports';
import MonthYearPicker from './components/MonthYearPicker';
import SummaryCards from './components/ReportSummaryCards';
import CategoryPieChart from './components/CategoryPieChart';
import DailyLineChart from './components/DailyTrendChart';
import RecentTransactions from './components/RecentTransactionsTable';
import ExportCSV from './components/ExportButton';
import { AIFinancialAnalysis } from '@/components/AIFinancialAnalysis';
import { BrainCircuit } from 'lucide-react';
import type { DailyData, ReportSummary, ReportTransaction } from '@/types/reports';

export default function ReportsPage() {
	const now = new Date();
	const [month, setMonth] = useState(now.getMonth() + 1);
	const [year, setYear] = useState(now.getFullYear());

	const { data, isLoading, error, refresh } = useReports(month, year);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
				<div className="text-white text-lg">جاري تحميل التقارير...</div>
			</div>
		);
	}

	if (error || !data?.ok) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
				<div className="text-red-400 text-lg">حدث خطأ: {error || data?.error}</div>
			</div>
		);
	}

	const { summary, charts, transactions } = data;

	return (
		<main
			className="min-h-screen   overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6 space-y-5 sm:space-y-6"
			dir="rtl"
		>
			{/* رأس الصفحة مع منتقي الشهر والسنة */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
				<h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
					<BrainCircuit className="w-6 h-6 text-emerald-400" />
					التقارير المالية
				</h1>
				<MonthYearPicker
					month={month}
					year={year}
					onChange={(m, y) => {
						setMonth(m);
						setYear(y);
					}}
				/>
			</div>

			{/* بطاقات الملخص */}
			<SummaryCards summary={(summary as ReportSummary) || {}} />

			{/* ************************************** */}
			{/* تحليل الذكاء الاصطناعي (يأخذ مساحة عرض كاملة) */}
			{/* ************************************** */}
			<AIFinancialAnalysis months={6} autoFetch={true} className="mt-2" />

			{/* الرسوم البيانية: تتراص عمودياً على الجوال، وأفقياً على الكبيرة */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				<CategoryPieChart data={charts?.categories || []} />
				<DailyLineChart data={(charts?.daily as DailyData[]) || []} />
			</div>

			{/* قسم آخر المعاملات مع زر التصدير */}
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<h2 className="text-lg sm:text-xl font-semibold text-white">أحدث المعاملات</h2>
					<ExportCSV
						data={(transactions as ReportTransaction[]) || []}
						filename={`report-${year}-${month}`}
					/>
				</div>
				<RecentTransactions transactions={(transactions as ReportTransaction[]) || []} />
			</div>
		</main>
	);
}
