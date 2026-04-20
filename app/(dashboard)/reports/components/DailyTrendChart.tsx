// app/(dashboard)/reports/components/DailyLineChart.tsx
'use client';

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from 'recharts';
import { DailyData } from '@/types/reports';

export default function DailyLineChart({ data }: { data: DailyData[] }) {
	if (!data || data.length === 0) {
		return (
			<div className="rounded-xl border border-white/20 bg-white/5 p-4 h-72 sm:h-80 flex items-center justify-center">
				<p className="text-slate-400 text-sm">لا توجد بيانات يومية كافية</p>
			</div>
		);
	}

	// ملء الأيام الناقصة بالقيمة 0
	const filled = [];
	for (let day = 1; day <= 31; day++) {
		const existing = data.find((d) => d.day === day);
		filled.push({ day, value: existing ? existing.value : 0 });
	}

	return (
		<div className="rounded-xl border border-white/20 bg-white/5 p-3 sm:p-4">
			<h3 className="text-base sm:text-lg font-semibold text-white mb-2 text-right">
				الاتجاه اليومي (صافي الدخل - المصروفات)
			</h3>
			<ResponsiveContainer width="100%" height={280}>
				<LineChart data={filled} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
					<XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
					<YAxis
						tick={{ fill: '#94a3b8', fontSize: 12 }}
						tickFormatter={(v) => `${v.toLocaleString()}`}
					/>
					<Tooltip
						formatter={(v: number) => `${v.toLocaleString()} SYP`}
						labelFormatter={(l) => `اليوم ${l}`}
						contentStyle={{
							backgroundColor: '#1e293b',
							border: 'none',
							borderRadius: '8px',
							color: '#fff',
						}}
					/>
					<ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#10b981"
						strokeWidth={2}
						dot={{ r: 2 }}
						activeDot={{ r: 4 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
