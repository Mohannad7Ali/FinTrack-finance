'use client';
import { useCallback } from 'react';
import CategoryChart from '@/components/dashboard/CategoryChart';
import SummaryCard from '@/components/dashboard/SummaryCard';
import TransactionForm from '@/components/dashboard/TransactionForm';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useSummary } from '@/hooks/useSummary';

export default function Dashboard() {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();
	const { data, error, isLoading, refresh } = useSummary(month, year);

	const handleCreated = useCallback(() => refresh(), [refresh]);

	const handleDeleteTransaction = useCallback(
		async (id: number) => {
			if (!confirm('هل أنت متأكد من رغبتك في حذف هذه المعاملة؟')) return;
			try {
				const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
				const json = await res.json().catch(() => ({}));
				if (!res.ok || json.ok === false) {
					alert(json.error || 'حدث خطأ أثناء حذف المعاملة');
					return;
				}
				refresh();
			} catch {
				alert('خطأ في الشبكة أثناء حذف المعاملة');
			}
		},
		[refresh]
	);

	if (isLoading) return <LoadingScreen />;
	if (error) return <ErrorScreen message={error} />;

	// Provide default empty data structure if data is missing (should not happen after loading/error)
	const safeData = data || {
		income: 0,
		expense: 0,
		balance: 0,
		transactions: [],
		categoriesChart: [],
	};

	const hasTransactions = safeData.transactions?.length > 0;

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 space-y-8">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<SummaryCard title="الإيرادات" value={safeData.income} color="emerald" />
				<SummaryCard title="المصروفات" value={safeData.expense} color="red" />
				<SummaryCard
					title="الرصيد"
					value={safeData.balance}
					color={safeData.balance >= 0 ? 'emerald' : 'red'}
				/>
			</div>

			<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-lg transition hover:border-white/20">
				<h2 className="text-sm font-semibold text-slate-100">معاملة جديدة</h2>
				<p className="text-xs text-slate-400 mt-1 mb-3">
					سجل الإيداعات والسحوبات لتحديث الملخص تلقائيًا.
				</p>
				<TransactionForm onCreated={handleCreated} />
			</div>

			<div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
				<h2 className="mb-4 text-sm font-semibold text-slate-100">المصروفات حسب الفئة</h2>
				<CategoryChart data={safeData.categoriesChart} />
			</div>

			<div>
				<h2 className="mb-3 text-sm font-semibold text-slate-100">معاملات هذا الشهر</h2>
				<div className="overflow-x-auto rounded-xl border border-white/10">
					{hasTransactions ? (
						<TransactionTable
							transactions={safeData.transactions}
							onDelete={handleDeleteTransaction}
						/>
					) : (
						<div className="text-center py-12 text-slate-400 text-sm">
							لا توجد معاملات بعد. ابدأ بإضافة معاملة جديدة!
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

// مكونات مساعدة (يمكن نقلها لملفات منفصلة)
function LoadingScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-3">
			<div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
			<p className="text-slate-300 text-sm animate-pulse">جاري التحميل...</p>
		</div>
	);
}

function ErrorScreen({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-2 text-red-400">
			<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p>{message}</p>
		</div>
	);
}
