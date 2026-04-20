// app/(dashboard)/reports/components/RecentTransactions.tsx
'use client';

import { ReportTransaction } from '@/types/reports';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function RecentTransactions({
	transactions,
}: {
	transactions: ReportTransaction[];
}) {
	if (!transactions || transactions.length === 0) {
		return (
			<div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
				لا توجد معاملات حديثة
			</div>
		);
	}

	return (
		<>
			{/* عرض الجدول للشاشات المتوسطة والكبيرة */}
			<div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-white/5">
				<table className="w-full text-sm">
					<thead className="border-b border-white/10 bg-slate-900/60">
						<tr>
							<th className="p-3 text-right text-slate-300">التاريخ</th>
							<th className="p-3 text-right text-slate-300">الوصف</th>
							<th className="p-3 text-right text-slate-300">الفئة</th>
							<th className="p-3 text-right text-slate-300">المحفظة</th>
							<th className="p-3 text-right text-slate-300">المبلغ</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((tx) => (
							<tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="p-3 whitespace-nowrap">
									{format(new Date(tx.occurredAt), 'dd MMM yyyy', { locale: ar })}
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
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* عرض البطاقات للشاشات الصغيرة */}
			<div className="block md:hidden space-y-3">
				{transactions.map((tx) => (
					<div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
						<div className="flex justify-between items-start">
							<span className="text-slate-400 text-xs">
								{format(new Date(tx.occurredAt), 'dd MMM yyyy', { locale: ar })}
							</span>
							<span
								className={cn(
									'font-bold text-base',
									tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
								)}
							>
								{tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString()}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<span className="text-slate-400">الوصف:</span> {tx.description || '-'}
							</div>
							<div>
								<span className="text-slate-400">الفئة:</span> {tx.category?.name || '-'}
							</div>
							<div>
								<span className="text-slate-400">المحفظة:</span> {tx.wallet.name}
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
