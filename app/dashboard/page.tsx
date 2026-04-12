'use client';
import CategoryChart from '@/components/dashboard/CategoryChart';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useSummary } from '@/hooks/useSummary';

export default function Dashboard() {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	const { data, error, isLoading, refresh } = useSummary(month, year);
	async function handleDeleteTransaction() {}
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen text-slate-300 animate-pulse">
				جاري التحميل...
			</div>
		);
	}
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen text-red-400 animate-bounce">
				{error}
			</div>
		);
	}
	if (!data) {
		return (
			<div className="flex items-center justify-center min-h-screen text-slate-300">
				لا يوجد بيانات لعرضها قم بإدخال بياناتك وابدأ بإدارة أموالك
			</div>
		);
	}
	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 space-y-8">
			{/* بطاقات الملخص */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<SummaryCard
					title="الإيرادات"
					value={data.income}
					color="emerald"
					description="إجمالي الإيرادات لهذا الشهر."
				/>
				<SummaryCard
					title="المصروفات"
					value={data.expense}
					color="red"
					description="إجمالي المصروفات لهذا الشهر."
				/>
				<SummaryCard
					title="الرصيد"
					value={data.balance}
					color={data.balance >= 0 ? 'emerald' : 'red'}
					description="صافي الرصيد لهذا الشهر."
				/>
			</div>
			{/* مخطط الفئات */}
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
				<h2 className="mb-4 text-sm text-slate-200">المصروفات حسب الفئة</h2>
				<CategoryChart data={data.categoriesChart} />
			</div>
			{/* جدول المعاملات */}
			<div>
				<h2 className="mb-3 text-sm text-slate-200">معاملات هذا الشهر</h2>
				<TransactionTable
					transactions={data.transactions || []}
					onDelete={handleDeleteTransaction}
				/>
			</div>
		</main>
	);
}
