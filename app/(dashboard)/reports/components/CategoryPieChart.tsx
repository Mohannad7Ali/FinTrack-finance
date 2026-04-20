// app/(dashboard)/reports/components/CategoryPieChart.tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategoryData } from '@/types/reports';

const COLORS = [
	'#22c55e',
	'#0ea5e9',
	'#eab308',
	'#f97316',
	'#a855f7',
	'#ef4444',
	'#8b5cf6',
	'#ec489a',
	'#14b8a6',
	'#6366f1',
];

interface CategoryPieChartProps {
	data: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className="rounded-xl border border-white/20 bg-white/5 p-4 h-72 sm:h-80 flex items-center justify-center">
				<p className="text-slate-400 text-sm">لا توجد مصروفات مسجلة</p>
			</div>
		);
	}

	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<div className="rounded-xl border border-white/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-4 transition-all hover:shadow-lg">
			<h3 className="text-base sm:text-lg font-semibold text-white mb-3 text-right">
				📊 توزيع المصروفات
			</h3>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={90}
						paddingAngle={6}
						label={({ name, percent }) => {
							if (!percent || percent < 0.05) return '';
							return `${name} ${(percent * 100).toFixed(0)}%`;
						}}
						labelLine={false}
					>
						{data.map((_, idx) => (
							<Cell
								key={`cell-${idx}`}
								fill={COLORS[idx % COLORS.length]}
								stroke="rgba(255,255,255,0.1)"
								strokeWidth={1}
							/>
						))}
					</Pie>
					<Tooltip
						formatter={(value: any) => {
							// التعامل مع القيم غير المعرفة
							if (value === undefined || value === null) return '0 SYP';
							const numValue = typeof value === 'number' ? value : parseFloat(value);
							if (isNaN(numValue)) return '0 SYP';
							const percentage = total > 0 ? ((numValue / total) * 100).toFixed(1) : '0';
							return `${numValue.toLocaleString()} SYP (${percentage}%)`;
						}}
						contentStyle={{
							backgroundColor: '#1e293b',
							border: '1px solid #334155',
							borderRadius: '12px',
							padding: '8px 12px',
							direction: 'rtl',
						}}
					/>
					<Legend
						layout="horizontal"
						verticalAlign="bottom"
						align="center"
						wrapperStyle={{ paddingTop: '20px', fontSize: '12px', direction: 'rtl' }}
						iconType="circle"
						iconSize={8}
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
