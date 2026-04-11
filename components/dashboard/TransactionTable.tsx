'use client';

import { Tx } from '@/types/summary';
type Props = {
	transactions: Tx[];
	onDelete: (id: number) => void;
};

export function TransactionTable({ transactions, onDelete }: Props) {
	return (
		<div className="bg-white/5 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-lg rounded-2xl">
			<table className="w-full test-xs md:text-sm">
				<thead className="bg-slate-900/60 border-b border-white/10">
					<tr>
						<th className="p-3 text-left text-slate-300">التاريخ</th>
						<th className="p-3 text-left text-slate-300">الوصف</th>
						<th className="p-3 text-left text-slate-300">الفئة</th>
						<th className="p-3 text-left text-slate-300">القيمة</th>
						<th className="p-3 text-left text-slate-300">إجراءات</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map((t) => (
						<tr key={t.id}>
							<td className="p-3">{new Date(t.occurredAt).toLocaleDateString('ar')}</td>
							<td className="p-3">{t.description || '-'}</td>
							<td className="p-3">{t.category?.name || 'بدون فئة'}</td>
							<td
								className={`p-3 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}
							>
								{t.type === 'INCOME' ? '+' : '-'} {t.amount.toFixed(2)}
							</td>
							<td className="p-3 text-right">
								<button
									onClick={() => onDelete(t.id)}
									className="text-red-500 hover:text-red-700 hover:underline transition-all duration-150"
								>
									حذف
								</button>
							</td>
						</tr>
					))}
					{transactions.length === 0 && (
						<tr>
							<td colSpan={5} className="p-4 text-center text-slate-400">
								لا توجد معاملات لهذا الشهر
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
