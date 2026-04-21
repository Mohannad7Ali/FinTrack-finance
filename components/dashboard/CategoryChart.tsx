// components/dashboard/CategoryChart.tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Props = { data: { name: string; value: number }[] };
const COLORS = ['#22c55e', '#0ea5e9', '#eab308', '#f97316', '#a855f7', '#ef4444', '#8b5cf6'];

const CategoryChart = ({ data }: Props) => {
	if (!data || data.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/5">
				<p className="text-sm text-slate-400">لا توجد بيانات للعرض</p>
			</div>
		);
	}

	return (
		<div className="w-full h-80 md:h-96">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="50%"
						innerRadius={50}
						outerRadius={80}
						paddingAngle={2}
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
							if (value === undefined || value === null) return '0 SYP';
							const num = typeof value === 'number' ? value : parseFloat(value);
							return isNaN(num) ? '0 SYP' : `${num.toLocaleString()} SYP`;
						}}
						contentStyle={{
							backgroundColor: '#1e293b',
							border: 'none',
							borderRadius: '8px',
							color: '#fff',
							direction: 'rtl',
						}}
					/>
					<Legend
						layout="horizontal"
						verticalAlign="bottom"
						align="center"
						wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
						formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CategoryChart;
