// app/(dashboard)/dashboard/page.tsx
'use client';

import { useCallback, useState } from 'react';
// import CategoryChart from '@/components/dashboard/CategoryChart';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useSummary } from '@/hooks/useSummary';
import { useME } from '@/hooks/useMe';
import { TransactionFormDialog } from '../transactions/components/TransactionFormDialog';
import { Button } from '@/components/ui/button';
// import DailyLineChart from '../reports/components/DailyTrendChart';
import { QuickStartGuideModal } from '@/components/dashboard/QuickStartGuideModal';
import { AIFinancialAnalysis } from '@/components/AIFinancialAnalysis'; // استيراد المكون

import {
	PlusCircle,
	TrendingUp,
	TrendingDown,
	Wallet,
	Sparkles,
	BarChart3,
	CalendarDays,
	Lightbulb,
} from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Category, Wallet as WalletType, Transaction } from '@/types/transactions';
import type { TransactionFormValues } from '@/lib/validators';

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
	};

	const { summary, charts, transaction: transactions } = safeData;
	const hasTransactions = transactions?.length > 0;
	const userName = userData?.ok && userData.authenticated ? userData.name : 'مستخدم';
	const currentMonthName = today.toLocaleDateString('ar', { month: 'long', year: 'numeric' });

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 space-y-6 md:space-y-8"
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
						<span className="text-emerald-400 font-semibold">{currentMonthName}</span>. تابع دخلك،
						مصروفاتك، ورصيدك في مكان واحد.
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
								className="group relative overflow-hidden border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300"
								onClick={() => setShowGuideModal(true)}
							>
								<Lightbulb className="w-4 h-4 animate-pulse group-hover:animate-bounce" />
								<span className="relative z-10">دليل البدء السريع</span>
								<div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* بطاقات الملخص */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<SummaryCard
					title="إجمالي الدخل"
					value={summary.income}
					color="emerald"
					icon={<TrendingUp className="w-5 h-5" />}
				/>
				<SummaryCard
					title="إجمالي المصروفات"
					value={summary.expense}
					color="red"
					icon={<TrendingDown className="w-5 h-5" />}
				/>
				<SummaryCard
					title="صافي الرصيد"
					value={summary.balance}
					color={summary.balance >= 0 ? 'emerald' : 'red'}
					icon={<Wallet className="w-5 h-5" />}
				/>
			</div>

			{/* ******************* */}
			{/* تحليل الذكاء الاصطناعي - يظهر بشكل بارز بعد البطاقات */}
			{/* ******************* */}
			<AIFinancialAnalysis months={6} autoFetch={true} className="mt-2" />

			{/* الرسوم البيانية */}
			{/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
					<div className="flex items-center gap-2 mb-3">
						<BarChart3 className="w-5 h-5 text-emerald-400" />
						<h2 className="text-base font-semibold text-white">توزيع المصروفات حسب الفئة</h2>
					</div>
					{charts.categories?.length > 0 ? (
						<CategoryChart data={charts.categories} />
					) : (
						<div className="text-center py-8 text-slate-400 text-sm">
							لا توجد مصروفات مسجلة هذا الشهر.
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
					<div className="flex items-center gap-2 mb-3">
						<CalendarDays className="w-5 h-5 text-emerald-400" />
						<h2 className="text-base font-semibold text-white">
							الاتجاه اليومي (صافي الدخل - المصروفات)
						</h2>
					</div>
					{charts.daily && charts.daily.length > 0 ? (
						<DailyLineChart data={charts.daily} />
					) : (
						<div className="h-64 flex items-center justify-center text-slate-400 text-sm">
							لا توجد بيانات يومية كافية
						</div>
					)}
				</div>
			</div> */}

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
					<TransactionTable transactions={transactions || []} onDelete={handleDeleteTransaction} />
				</div>
			</div>

			{/* دليل البدء للمستخدم الجديد */}
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

function LoadingScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-3">
			<div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
			<p className="text-slate-300 text-sm">جاري التحميل...</p>
		</div>
	);
}

function ErrorScreen({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-2 text-red-400 text-center p-4">
			<p>{message}</p>
			<Button variant="outline" onClick={() => window.location.reload()}>
				إعادة المحاولة
			</Button>
		</div>
	);
}
