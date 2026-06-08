'use client';

import { cn } from '@/lib/utils';
import { Transaction } from '@/types/transactions';
import { useState, useEffect } from 'react';

interface TransactionsTableProps {
	transactions: Transaction[];
	onEdit: (tx: Transaction) => void;
	onDelete: (tx: Transaction) => void;
}

// Helper to format date with time
const formatDateTime = (dateString: string | Date) => {
	const date = new Date(dateString);
	return {
		date: date.toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' }),
		time: date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
	};
};

// Helper to get category icon (you can replace with actual icons if available)
const getCategoryIcon = (categoryName?: string) => {
	const icons: Record<string, string> = {
		طعام: '🍔',
		مشروبات: '☕',
		تسوق: '🛒',
		مواصلات: '🚗',
		ترفيه: '🎬',
		صحة: '💊',
		تعليم: '📚',
		راتب: '💰',
		استثمار: '📈',
		default: '📌',
	};
	if (!categoryName) return icons.default;
	for (const [key, icon] of Object.entries(icons)) {
		if (categoryName.includes(key)) return icon;
	}
	return icons.default;
};

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
	const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
	const [isMobile, setIsMobile] = useState(false);

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
			<div className="text-center py-12 text-slate-400 border border-dashed border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
				<div className="text-4xl mb-2">📭</div>
				<p>لا توجد معاملات في هذا الشهر</p>
			</div>
		);
	}

	return (
		<div>
			{/* View toggle - desktop only */}
			{!isMobile && (
				<div className="flex justify-end mb-4">
					<div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-1 flex gap-1 shadow-lg">
						<button
							onClick={() => setViewMode('table')}
							className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
								viewMode === 'table'
									? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
									: 'text-slate-300 hover:bg-slate-700/50'
							}`}
						>
							📋 جدول
						</button>
						<button
							onClick={() => setViewMode('cards')}
							className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
								viewMode === 'cards'
									? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
									: 'text-slate-300 hover:bg-slate-700/50'
							}`}
						>
							🃏 بطاقات
						</button>
					</div>
				</div>
			)}

			{/* Table View - Desktop only */}
			{!isMobile && viewMode === 'table' && (
				<div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
					<table className="w-full text-sm min-w-[700px]">
						<thead className="border-b border-white/10 bg-slate-900/80">
							<tr className="text-slate-200">
								<th className="p-4 text-right font-semibold">📅 التاريخ</th>
								<th className="p-4 text-right font-semibold">📝 الوصف</th>
								<th className="p-4 text-right font-semibold">🏷️ الفئة</th>
								<th className="p-4 text-right font-semibold">👛 المحفظة</th>
								<th className="p-4 text-right font-semibold">💰 المبلغ</th>
								<th className="p-4 text-right font-semibold">⚙️ إجراءات</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((tx) => {
								const { date, time } = formatDateTime(tx.occurredAt);
								return (
									<tr
										key={tx.id}
										className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150"
									>
										<td className="p-4 whitespace-nowrap text-slate-300">
											<div>{date}</div>
											<div className="text-xs text-slate-500">{time}</div>
										</td>
										<td className="p-4 text-slate-200 max-w-[200px] truncate">
											{tx.description || '—'}
										</td>
										<td className="p-4">
											<div className="flex items-center gap-2">
												<span>{getCategoryIcon(tx.category?.name)}</span>
												<span className="text-slate-200">{tx.category?.name || 'بدون فئة'}</span>
											</div>
										</td>
										<td className="p-4 whitespace-nowrap text-slate-200">{tx.wallet.name}</td>
										<td
											className={cn(
												'p-4 font-bold whitespace-nowrap',
												tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
											)}
										>
											{tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString()} ₪
										</td>
										<td className="p-4">
											<div className="flex gap-3">
												<button
													onClick={() => onEdit(tx)}
													className="text-amber-400 hover:text-amber-300 transition-colors"
												>
													✏️ تعديل
												</button>
												<button
													onClick={() => onDelete(tx)}
													className="text-rose-400 hover:text-rose-300 transition-colors"
												>
													🗑️ حذف
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Cards View - Mobile always + Desktop optional */}
			{(isMobile || viewMode === 'cards') && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{transactions.map((tx) => {
						const { date, time } = formatDateTime(tx.occurredAt);
						const categoryIcon = getCategoryIcon(tx.category?.name);
						return (
							<div
								key={tx.id}
								className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-500/50"
							>
								{/* Header: Amount + Type Badge */}
								<div className="flex justify-between items-start mb-4">
									<div
										className={cn(
											'text-2xl font-bold',
											tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
										)}
									>
										{tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString()} ₪
									</div>
									<span
										className={cn(
											'text-xs px-2 py-1 rounded-full font-medium',
											tx.type === 'INCOME'
												? 'bg-emerald-500/20 text-emerald-300'
												: 'bg-rose-500/20 text-rose-300'
										)}
									>
										{tx.type === 'INCOME' ? 'دخل' : 'مصروف'}
									</span>
								</div>

								{/* Date & Time */}
								<div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
									<span>📅</span>
									<span>{date}</span>
									<span className="text-slate-500">•</span>
									<span>🕒 {time}</span>
								</div>

								{/* Description */}
								<div className="mb-3">
									<div className="text-slate-400 text-xs mb-1">📝 الوصف</div>
									<div className="text-slate-200 text-sm break-words">{tx.description || '—'}</div>
								</div>

								{/* Category & Wallet */}
								<div className="grid grid-cols-2 gap-3 mb-4">
									<div>
										<div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
											<span>🏷️</span> الفئة
										</div>
										<div className="flex items-center gap-2 text-slate-200 text-sm">
											<span>{categoryIcon}</span>
											<span>{tx.category?.name || 'بدون فئة'}</span>
										</div>
									</div>
									<div>
										<div className="text-slate-400 text-xs mb-1 flex items-center gap-1">
											<span>👛</span> المحفظة
										</div>
										<div className="text-slate-200 text-sm font-medium truncate">
											{tx.wallet.name}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex justify-end gap-3 pt-3 border-t border-white/10 mt-2">
									<button
										onClick={() => onEdit(tx)}
										className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors text-sm bg-amber-400/10 px-3 py-1.5 rounded-lg"
									>
										✏️ تعديل
									</button>
									<button
										onClick={() => onDelete(tx)}
										className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors text-sm bg-rose-400/10 px-3 py-1.5 rounded-lg"
									>
										🗑️ حذف
									</button>
								</div>

								{/* Decorative gradient line on hover */}
								<div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-b-2xl"></div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
