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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen text-slate-300">
				جاري التحميل...
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
			<br />
			<CategoryChart
				data={[
					{ name: 'Category 1', value: 5 },
					{ name: 'Category 2', value: 1 },
					{ name: 'Category 43', value: 15 },
					{ name: 'Category 4', value: 21 },
				]}
			/>
			<TransactionTable transactions={[]} onDelete={(id) => console.log(id)} />
		</main>
	);
}
