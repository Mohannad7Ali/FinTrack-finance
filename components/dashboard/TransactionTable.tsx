// components/dashboard/TransactionTable.tsx
'use client';

import { Tx } from '@/types/summary';

type Props = {
	transactions: Tx[];
	onDelete: (id: number) => void;
	currency: string;
};

export function TransactionTable({ transactions, onDelete, currency }: Props) {
	if (transactions.length === 0) {
		return (
			<div className="text-center py-12 text-slate-400 text-sm">لا توجد معاملات لهذا الشهر</div>
		);
	}

	return (
		<>
			{/* عرض الجدول على الشاشات المتوسطة والكبيرة */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full text-xs md:text-sm">
					<thead className="bg-slate-900/60 border-b border-white/10">
						<tr>
							<th className="p-3 text-right text-slate-300">التاريخ</th>
							<th className="p-3 text-right text-slate-300">الوصف</th>
							<th className="p-3 text-right text-slate-300">الفئة</th>
							<th className="p-3 text-right text-slate-300">القيمة</th>
							<th className="p-3 text-right text-slate-300">إجراءات</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((t) => (
							<tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="p-3 whitespace-nowrap">
									{new Date(t.occurredAt).toLocaleDateString('ar')}
								</td>
								<td className="p-3">{t.description || '-'}</td>
								<td className="p-3">{t.category?.name || 'بدون فئة'}</td>
								<td
									className={`p-3 font-semibold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}
								>
									{t.type === 'INCOME' ? '+' : '-'} {t.amount.toFixed(2)} {currency}
								</td>
								<td className="p-3">
									<button
										onClick={() => onDelete(t.id)}
										className="text-red-500 hover:text-red-700 transition"
									>
										حذف
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* عرض البطاقات على الجوال */}
			<div className="block md:hidden space-y-3">
				{transactions.map((t) => (
					<div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
						<div className="flex justify-between items-start">
							<span className="text-slate-400 text-xs">
								{new Date(t.occurredAt).toLocaleDateString('ar')}
							</span>
							<span
								className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}
							>
								{t.type === 'INCOME' ? '+' : '-'} {t.amount.toFixed(2)}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<span className="text-slate-400">الوصف:</span> {t.description || '-'}
							</div>
							<div>
								<span className="text-slate-400">الفئة:</span> {t.category?.name || 'بدون فئة'}
							</div>
						</div>
						<div className="flex justify-end pt-2">
							<button
								onClick={() => onDelete(t.id)}
								className="text-red-500 text-sm hover:underline"
							>
								حذف
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
