'use client';

import { cn } from '@/lib/utils';
import { Transaction } from '@/types/transactions';
import { useState, useEffect } from 'react';

interface TransactionsTableProps {
	transactions: Transaction[];
	onEdit: (tx: Transaction) => void;
	onDelete: (tx: Transaction) => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
	const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
	const [isMobile, setIsMobile] = useState(false);

	// كشف حجم الشاشة
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	if (transactions.length === 0) {
		return (
			<div className="text-center py-12 text-slate-400 border border-dashed border-white/20 rounded-xl">
				لا توجد معاملات في هذا الشهر
			</div>
		);
	}

	return (
		<div>
			{/* زر تبديل العرض - يظهر فقط على الشاشات الكبيرة (غير الجوال) */}
			{!isMobile && (
				<div className="flex justify-end mb-3">
					<div className="bg-slate-800/50 rounded-lg p-1 flex gap-1">
						<button
							onClick={() => setViewMode('table')}
							className={`px-3 py-1 text-sm rounded-md transition ${
								viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400'
							}`}
						>
							جدول
						</button>
						<button
							onClick={() => setViewMode('cards')}
							className={`px-3 py-1 text-sm rounded-md transition ${
								viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400'
							}`}
						>
							بطاقات
						</button>
					</div>
				</div>
			)}

			{/* عرض الجدول - فقط على الشاشات الكبيرة وعند اختيار الجدول */}
			{!isMobile && viewMode === 'table' && (
				<div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
					<table className="w-full text-sm min-w-[600px]">
						<thead className="border-b border-white/10 bg-slate-900/60">
							<tr>
								<th className="p-3 text-right text-slate-300">التاريخ</th>
								<th className="p-3 text-right text-slate-300">الوصف</th>
								<th className="p-3 text-right text-slate-300">الفئة</th>
								<th className="p-3 text-right text-slate-300">المحفظة</th>
								<th className="p-3 text-right text-slate-300">المبلغ</th>
								<th className="p-3 text-right text-slate-300">إجراءات</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((tx) => (
								<tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
									<td className="p-3 whitespace-nowrap">
										{new Date(tx.occurredAt).toLocaleDateString('ar')}
									</td>
									<td className="p-3">{tx.description || '-'}</td>
									<td className="p-3">{tx.category?.name || 'بدون فئة'}</td>
									<td className="p-3 whitespace-nowrap">{tx.wallet.name}</td>
									<td
										className={cn(
											'p-3 font-semibold whitespace-nowrap',
											tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
										)}
									>
										{tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString()}
									</td>
									<td className="p-3 flex gap-2 whitespace-nowrap">
										<button
											onClick={() => onEdit(tx)}
											className="text-amber-400 hover:text-amber-300"
										>
											تعديل
										</button>
										<button
											onClick={() => onDelete(tx)}
											className="text-red-400 hover:text-red-300"
										>
											حذف
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* عرض البطاقات - على الجوال دائماً، وعلى الكبيرة إذا اختار المستخدم */}
			{(isMobile || viewMode === 'cards') && (
				<div className="space-y-3">
					{transactions.map((tx) => (
						<div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
							<div className="flex justify-between items-start">
								<div className="text-right">
									<div className="text-slate-400 text-xs">التاريخ</div>
									<div className="text-white text-sm font-medium">
										{new Date(tx.occurredAt).toLocaleDateString('ar')}
									</div>
								</div>
								<div className="text-left">
									<div
										className={cn(
											'text-lg font-bold',
											tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
										)}
									>
										{tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString()}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<div className="text-slate-400 text-xs">الوصف</div>
									<div className="text-white text-sm">{tx.description || '-'}</div>
								</div>
								<div>
									<div className="text-slate-400 text-xs">الفئة</div>
									<div className="text-white text-sm">{tx.category?.name || 'بدون فئة'}</div>
								</div>
								<div>
									<div className="text-slate-400 text-xs">المحفظة</div>
									<div className="text-white text-sm">{tx.wallet.name}</div>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-2 border-t border-white/10">
								<button
									onClick={() => onEdit(tx)}
									className="text-amber-400 hover:text-amber-300 text-sm px-3 py-1 rounded bg-amber-400/10"
								>
									تعديل
								</button>
								<button
									onClick={() => onDelete(tx)}
									className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-400/10"
								>
									حذف
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
