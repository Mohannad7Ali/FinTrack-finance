'use client';

export function TransactionsHeader() {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
			<h1 className="text-xl font-bold text-white mb-2">إدارة المعاملات المالية</h1>
			<p className="text-slate-300 text-sm leading-relaxed">
				سجل جميع إيداعاتك ومصروفاتك. يمكنك إضافة معاملات جديدة، تعديلها، أو حذفها. يتم تحديث رصيد
				المحفظة تلقائياً عند كل عملية.
			</p>
		</div>
	);
}
