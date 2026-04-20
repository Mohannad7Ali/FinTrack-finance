// app/(dashboard)/reports/components/ExportCSV.tsx
'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportTransaction } from '@/types/reports';

export default function ExportCSV({
	data,
	filename,
}: {
	data: ReportTransaction[];
	filename: string;
}) {
	const handleExport = () => {
		const headers = ['التاريخ', 'النوع', 'المبلغ', 'الوصف', 'الفئة', 'المحفظة'];
		const rows = data.map((tx) => [
			new Date(tx.occurredAt).toLocaleDateString('ar'),
			tx.type === 'INCOME' ? 'دخل' : 'مصروف',
			tx.amount,
			tx.description || '',
			tx.category?.name || '',
			tx.wallet.name,
		]);
		const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
		const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.href = url;
		link.setAttribute('download', `${filename}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	if (!data || data.length === 0) return null;

	return (
		<Button
			variant="outline"
			onClick={handleExport}
			className="gap-2 border-white/20 text-white hover:bg-white/10"
		>
			<Download className="w-4 h-4" />
			تصدير CSV
		</Button>
	);
}
