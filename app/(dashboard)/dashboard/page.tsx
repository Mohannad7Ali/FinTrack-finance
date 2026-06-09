'use client';

import { useCallback, useState } from 'react';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useSummary } from '@/hooks/useSummary';
import { useME } from '@/hooks/useMe';
import { TransactionFormDialog } from '../transactions/components/TransactionFormDialog';
import { Button } from '@/components/ui/button';
import { QuickStartGuideModal } from '@/components/dashboard/QuickStartGuideModal';
import { AIFinancialAnalysis } from '@/components/AIFinancialAnalysis';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, Sparkles, Lightbulb } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Category, Wallet as WalletType, Transaction } from '@/types/transactions';
import type { TransactionFormValues } from '@/lib/validators';
// في أعلى صفحة dashboard/page.tsx
import { LoadingScreen } from '@/components/common/DashboardLoadingScreen';
import { ErrorScreen } from '@/components/common/DashboardErrorScreen';

export default function Dashboard() {
	const today = new Date();
	const month = today.getMonth() + 1;
	const year = today.getFullYear();

	const { data: summaryData, error, isLoading, refresh } = useSummary(month, year);
	const { data: userData } = useME();

	const { data: categoriesData } = useSWR<{ ok: boolean; categories: Category[] }>(
		'/api/categories',
		fetcher
	);
	const { data: walletsData } = useSWR<{ ok: boolean; wallets: WalletType[] }>(
		'/api/wallets',
		fetcher
	);

	const [showAddDialog, setShowAddDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingTx] = useState<Transaction | null>(null);
	const [showGuideModal, setShowGuideModal] = useState(false);

	// العملة المفضلة من الـ API
	const preferredCurrency = userData?.preferredCurrency || 'SYP';

	const onSubmit = useCallback(
		async (values: TransactionFormValues) => {
			setIsSubmitting(true);
			try {
				const payload = {
					type: values.type,
					amount: parseFloat(values.amount),
					occurredAt: values.occurredAt.toISOString(),
					description: values.description || undefined,
					categoryId: values.categoryId ? parseInt(values.categoryId) : null,
					walletId: parseInt(values.walletId),
				};
				const res = await fetch('/api/transactions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
				const json = await res.json();
				if (!res.ok || !json.ok) throw new Error(json.error || 'فشلت العملية');
				refresh();
				setShowAddDialog(false);
			} catch (err: any) {
				alert(err.message);
			} finally {
				setIsSubmitting(false);
			}
		},
		[refresh]
	);

	const handleDeleteTransaction = useCallback(
		async (id: number) => {
			if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return;
			try {
				const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
				const json = await res.json().catch(() => ({}));
				if (!res.ok || json.ok === false) {
					alert(json.error || 'حدث خطأ أثناء الحذف');
					return;
				}
				refresh();
			} catch {
				alert('خطأ في الشبكة');
			}
		},
		[refresh]
	);

	if (isLoading) return <LoadingScreen />;
	if (error) return <ErrorScreen message={error} />;

	const safeData = summaryData || {
		summary: { income: 0, expense: 0, balance: 0 },
		charts: { categories: [], daily: [] },
		transaction: [],
		preferredCurrency: 'SYP',
	};

	const { summary, transaction: transactions } = safeData;
	const hasTransactions = transactions?.length > 0;
	const userName = userData?.ok && userData.authenticated ? userData.name : 'مستخدم';
	const currentMonthName = today.toLocaleDateString('ar', { month: 'long', year: 'numeric' });

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 space-y-6 md:space-y-8 overflow-x-hidden"
			dir="rtl"
		>
			{/* Hero Section */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/30 via-slate-800/50 to-emerald-900/30 border border-white/10 p-5 md:p-6">
				<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl -z-0" />
				<div className="relative z-10">
					<div className="flex items-center gap-2 text-emerald-400 mb-2">
						<Sparkles className="w-4 h-4" />
						<span className="text-xs font-medium">لوحة التحكم الذكية</span>
					</div>
					<h1 className="text-2xl md:text-3xl font-bold text-white">مرحباً، {userName} 👋</h1>
					<p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl">
						نظرة عامة على أدائك المالي لشهر{' '}
						<span className="text-emerald-400 font-semibold">{currentMonthName}</span>. جميع الأرقام
						بالعملة المفضلة لديك: <strong>{preferredCurrency}</strong>
					</p>
					<div className="flex flex-wrap gap-3 mt-4">
						<Button
							onClick={() => setShowAddDialog(true)}
							className="bg-emerald-600 hover:bg-emerald-500 gap-2 shadow-lg"
						>
							<PlusCircle className="w-4 h-4" />
							تسجيل معاملة جديدة
						</Button>
						{!hasTransactions && (
							<Button
								variant="outline"
								className="group relative overflow-hidden border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 gap-2"
								onClick={() => setShowGuideModal(true)}
							>
								<Lightbulb className="w-4 h-4" />
								دليل البدء السريع
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* بطاقات الملخص مع العملة */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<SummaryCard
					title="إجمالي الدخل"
					value={summary.income}
					currency={preferredCurrency}
					color="emerald"
					icon={<TrendingUp className="w-5 h-5" />}
				/>
				<SummaryCard
					title="إجمالي المصروفات"
					value={summary.expense}
					currency={preferredCurrency}
					color="red"
					icon={<TrendingDown className="w-5 h-5" />}
				/>
				<SummaryCard
					title="صافي الرصيد"
					value={summary.balance}
					currency={preferredCurrency}
					color={summary.balance >= 0 ? 'emerald' : 'red'}
					icon={<Wallet className="w-5 h-5" />}
				/>
			</div>

			{/* تحليل الذكاء الاصطناعي */}
			<AIFinancialAnalysis autoFetch={true} className="mt-2" />

			{/* جدول المعاملات */}
			<div>
				<div className="flex justify-between items-center mb-3">
					<h2 className="text-base font-semibold text-white">أحدث المعاملات</h2>
					{hasTransactions && (
						<span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">
							{transactions.length} معاملة
						</span>
					)}
				</div>
				<div className="rounded-xl border border-white/10 bg-white/5 p-4">
					<TransactionTable
						transactions={transactions || []}
						onDelete={handleDeleteTransaction}
						currency={preferredCurrency}
					/>
				</div>
			</div>

			{/* دليل البدء */}
			{!hasTransactions && (
				<div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 to-slate-900/50 p-5">
					<h3 className="text-md font-semibold text-white mb-2 flex items-center gap-2">
						<Lightbulb className="w-5 h-5 text-emerald-400" />
						كيف تبدأ؟
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
						<div className="flex items-start gap-2">
							<span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
								1
							</span>
							<span>أضف معاملة دخلك الأول</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
								2
							</span>
							<span>سجل بعض المصروفات اليومية</span>
						</div>
						<div className="flex items-start gap-2">
							<span className="bg-emerald-500/20 text-emerald-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
								3
							</span>
							<span>شاهد التحليلات تتحسن!</span>
						</div>
					</div>
				</div>
			)}

			{/* حوار الإضافة */}
			<TransactionFormDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				editingTx={editingTx}
				categories={categoriesData?.categories || []}
				wallets={walletsData?.wallets || []}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			/>
			<QuickStartGuideModal open={showGuideModal} onOpenChange={setShowGuideModal} />
		</main>
	);
}

// دوال مساعدة (LoadingScreen, ErrorScreen) كما هي موجودة لديك
