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
	Area,
	ComposedChart,
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

	// Fill missing days with zero
	const filled: DailyData[] = [];
	for (let day = 1; day <= 31; day++) {
		const existing = data.find((d) => d.day === day);
		filled.push({ day, value: existing ? existing.value : 0 });
	}

	// Find max value for better Y axis domain
	const maxValue = Math.max(...filled.map((d) => Math.abs(d.value)), 100);
	const minValue = Math.min(...filled.map((d) => d.value), 0);
	const yDomain = [minValue - (maxValue - minValue) * 0.1, maxValue + (maxValue - minValue) * 0.1];

	return (
		<div className="rounded-xl border border-white/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm p-4 transition-all hover:shadow-lg">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-base sm:text-lg font-semibold text-white">📈 الاتجاه اليومي</h3>
				<div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
					صافي الدخل - المصروفات
				</div>
			</div>
			<ResponsiveContainer width="100%" height={300}>
				<ComposedChart data={filled} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
					<defs>
						<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
					<XAxis
						dataKey="day"
						tick={{ fill: '#94a3b8', fontSize: 12 }}
						label={{
							value: 'اليوم',
							position: 'insideBottom',
							offset: -5,
							fill: '#94a3b8',
							fontSize: 11,
						}}
					/>
					<YAxis
						tick={{ fill: '#94a3b8', fontSize: 12 }}
						tickFormatter={(v) => v.toLocaleString()}
						domain={yDomain}
						label={{
							value: 'القيمة (SYP)',
							angle: -90,
							position: 'insideLeft',
							fill: '#94a3b8',
							fontSize: 11,
						}}
					/>
					<Tooltip
						formatter={(value: any) => {
							// Safe handling for any value type
							const num = typeof value === 'number' ? value : Number(value);
							if (isNaN(num)) return ['0 SYP', 'الصافي'];
							return [`${num.toLocaleString()} SYP`, 'الصافي'];
						}}
						labelFormatter={(label) => `اليوم ${label}`}
						contentStyle={{
							backgroundColor: '#1e293b',
							border: '1px solid #334155',
							borderRadius: '12px',
							padding: '8px 12px',
							color: '#f1f5f9',
							direction: 'rtl',
						}}
						itemStyle={{ color: '#10b981' }}
					/>
					<ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
					<Area type="monotone" dataKey="value" stroke="none" fill="url(#colorValue)" />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#10b981"
						strokeWidth={2.5}
						dot={{ r: 2, fill: '#10b981', stroke: '#fff', strokeWidth: 1 }}
						activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
					/>
				</ComposedChart>
			</ResponsiveContainer>
			<div className="flex justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-white/10">
				<span>📊 إجمالي الأيام المعروضة: {filled.filter((d) => d.value !== 0).length}</span>
				<span>💰 أعلى قيمة: {Math.max(...filled.map((d) => d.value)).toLocaleString()} SYP</span>
				<span>📉 أقل قيمة: {Math.min(...filled.map((d) => d.value)).toLocaleString()} SYP</span>
			</div>
		</div>
	);
}
