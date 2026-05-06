// app/(dashboard)/reports/components/DailyLineChart.tsx
'use client';

import {
	ComposedChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	Area,
} from 'recharts';
import { DailyData } from '@/types/reports';

export default function DailyLineChart({ data }: { data: DailyData[] }) {
	// Guard against missing or empty data
	if (!data || data.length === 0) {
		return (
			<div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl p-8 h-80 flex items-center justify-center shadow-2xl">
				<div className="text-center space-y-2">
					<span className="text-3xl opacity-30">📈</span>
					<p className="text-slate-400 text-sm">لا توجد بيانات يومية كافية</p>
				</div>
			</div>
		);
	}

	// Normalize and validate data: ensure each value is a number, default to 0
	const validatedData = data.map((item) => ({
		day: item.day,
		value: typeof item.value === 'number' && !isNaN(item.value) ? item.value : 0,
	}));

	// Fill missing days 1–31 with zero (or existing value)
	const filled: DailyData[] = [];
	for (let day = 1; day <= 31; day++) {
		const existing = validatedData.find((d) => d.day === day);
		filled.push({ day, value: existing ? existing.value : 0 });
	}

	// Calculate min/max safely
	const values = filled.map((d) => d.value);
	const maxValue = values.length ? Math.max(...values, 0) : 0;
	const minValue = values.length ? Math.min(...values, 0) : 0;

	// If all values are zero, provide a sensible default domain
	let yDomain: [number, number];
	if (maxValue === 0 && minValue === 0) {
		yDomain = [-10, 10]; // neutral domain to show the zero line
	} else {
		const padding = (maxValue - minValue) * 0.1 || 1; // avoid zero padding
		yDomain = [minValue - padding, maxValue + padding];
	}

	// Ensure domain numbers are finite
	if (isNaN(yDomain[0]) || isNaN(yDomain[1])) {
		yDomain = [-100, 100];
	}

	const activeDays = filled.filter((d) => d.value !== 0).length;
	const highest = Math.max(...values, 0);
	const lowest = Math.min(...values, 0);

	return (
		<div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:shadow-2xl hover:border-slate-600/60 group">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
				<h3 className="text-xl font-bold text-white flex items-center gap-3">
					<span className="text-2xl bg-white/10 p-1.5 rounded-xl backdrop-blur">📈</span>
					الاتجاه اليومي
				</h3>
				<span className="text-xs font-medium text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
					صافي الدخل - المصروفات
				</span>
			</div>

			<ResponsiveContainer width="100%" height={300}>
				<ComposedChart data={filled} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
					<defs>
						<linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
					<XAxis
						dataKey="day"
						tick={{ fill: '#94a3b8', fontSize: 12 }}
						tickLine={false}
						axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
						label={{
							value: 'اليوم',
							position: 'insideBottom',
							offset: -8,
							fill: '#64748b',
							fontSize: 11,
						}}
					/>
					<YAxis
						tick={{ fill: '#94a3b8', fontSize: 12 }}
						tickFormatter={(v) => v.toLocaleString()}
						tickLine={false}
						axisLine={false}
						domain={yDomain}
						label={{
							value: 'القيمة (SYP)',
							angle: -90,
							position: 'insideLeft',
							offset: 0,
							fill: '#64748b',
							fontSize: 11,
						}}
					/>
					<Tooltip
						formatter={(value: any) => {
							const num = typeof value === 'number' ? value : Number(value);
							if (isNaN(num)) return ['0 SYP', 'الصافي'];
							return [`${num.toLocaleString()} SYP`, 'الصافي'];
						}}
						labelFormatter={(label) => `اليوم ${label}`}
						contentStyle={{
							backgroundColor: 'rgba(15,23,42,0.95)',
							border: '1px solid rgba(16,185,129,0.4)',
							borderRadius: '14px',
							padding: '10px 14px',
							backdropFilter: 'blur(12px)',
							direction: 'rtl',
							boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
						}}
						itemStyle={{ color: '#6ee7b7' }}
						labelStyle={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}
					/>
					<ReferenceLine
						y={0}
						stroke="#ef4444"
						strokeOpacity={0.6}
						strokeDasharray="5 5"
						strokeWidth={1.5}
					/>
					<Area type="monotone" dataKey="value" stroke="none" fill="url(#dailyGradient)" />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#10b981"
						strokeWidth={2.5}
						dot={false}
						activeDot={{
							r: 6,
							fill: '#10b981',
							stroke: '#fff',
							strokeWidth: 3,
						}}
					/>
				</ComposedChart>
			</ResponsiveContainer>

			{/* Stats bar */}
			<div className="mt-5 pt-4 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2 text-xs text-slate-400">
					<span className="w-2 h-2 rounded-full bg-emerald-400" />
					<span>أيام النشاط: {activeDays}</span>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5 text-xs">
						<span className="text-emerald-400 font-semibold text-sm">
							{highest.toLocaleString()} SYP
						</span>
						<span className="text-slate-500">أعلى</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs">
						<span className="text-red-400 font-semibold text-sm">
							{lowest.toLocaleString()} SYP
						</span>
						<span className="text-slate-500">أدنى</span>
					</div>
				</div>
			</div>
		</div>
	);
}
