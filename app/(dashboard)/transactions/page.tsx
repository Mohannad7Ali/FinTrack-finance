'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { transactionFormSchema } from '@/lib/validators';
import { TransactionFormDialog } from './components/TransactionFormDialog';
import { TransactionsHeader } from './components/TransactionsHeader';
import { TransactionsFilters } from './components/TransactionsFilters';
import { TransactionsTable } from './components/TransactionsTable';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';

// ========== Types ==========
import { Transaction, Category, Wallet } from '@/types/transactions';
import * as z from 'zod';
type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// ========== Fetcher ==========
import { fetcher } from '@/lib/fetcher';

export default function TransactionsPage() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// Filters
	const [filterMonth, setFilterMonth] = useState<Date>(new Date());
	const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

	// SWR for transactions
	const {
		data: txData,
		error: txError,
		isLoading: txLoading,
		mutate,
	} = useSWR<{ ok: boolean; transactions: Transaction[] }>(
		`/api/transactions?month=${filterMonth.getMonth() + 1}&year=${filterMonth.getFullYear()}`,
		fetcher
	);

	// SWR for categories & wallets
	const { data: catData } = useSWR<{ ok: boolean; categories: Category[] }>(
		'/api/categories',
		fetcher
	);
	const { data: walletData } = useSWR<{ ok: boolean; wallets: Wallet[] }>('/api/wallets', fetcher);

	const categories = catData?.categories || [];
	const wallets = walletData?.wallets || [];

	// UI state
	const [editingTx, setEditingTx] = useState<Transaction | null>(null);
	const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Submit handler (add/edit) – manual conversion as you wrote
	const onSubmit = async (values: TransactionFormValues) => {
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const payload = {
				type: values.type,
				amount: parseFloat(values.amount),
				occurredAt: values.occurredAt.toISOString(),
				description: values.description || undefined,
				categoryId: values.categoryId ? parseInt(values.categoryId) : null,
				walletId: parseInt(values.walletId),
			};

			const url = editingTx ? `/api/transactions/${editingTx.id}` : '/api/transactions';
			const method = editingTx ? 'PATCH' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشلت العملية');

			await mutate();
			setShowAddDialog(false);
			setEditingTx(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete handler
	const confirmDelete = async () => {
		if (!deletingTx) return;
		setIsSubmitting(true);
		try {
			const res = await fetch(`/api/transactions/${deletingTx.id}`, { method: 'DELETE' });
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل الحذف');
			await mutate();
			setDeletingTx(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Filter transactions
	const transactions = txData?.ok ? txData.transactions : [];
	const filteredTransactions = transactions.filter((tx) => {
		if (filterType === 'ALL') return true;
		return tx.type === filterType;
	});

	if (!mounted) return <LoadingScreen />;
	if (txLoading) return <LoadingScreen />;
	if (txError) return <ErrorScreen message={txError.message} />;

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 p-4 md:p-6 space-y-6"
			dir="rtl"
		>
			<TransactionsHeader />

			<TransactionsFilters
				filterMonth={filterMonth}
				setFilterMonth={setFilterMonth}
				filterType={filterType}
				setFilterType={setFilterType}
				onAddNew={() => {
					setEditingTx(null);
					setShowAddDialog(true);
				}}
			/>

			{errorMsg && (
				<div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
					{errorMsg}
				</div>
			)}

			<TransactionsTable
				transactions={filteredTransactions}
				onEdit={(tx) => {
					setEditingTx(tx);
					setShowAddDialog(true);
				}}
				onDelete={setDeletingTx}
			/>

			<TransactionFormDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				editingTx={editingTx}
				categories={categories}
				wallets={wallets}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
			/>

			{/* Delete Confirmation Dialog */}
			{deletingTx && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold text-white mb-2">حذف المعاملة</h3>
						<p className="text-slate-300 mb-4">
							هل أنت متأكد من حذف هذه المعاملة؟ سيتم عكس تأثيرها على رصيد المحفظة.
						</p>
						<div className="flex justify-end gap-3">
							<button
								onClick={() => setDeletingTx(null)}
								className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600"
							>
								إلغاء
							</button>
							<button
								onClick={confirmDelete}
								disabled={isSubmitting}
								className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
							>
								{isSubmitting ? 'جاري الحذف...' : 'نعم، احذف'}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
