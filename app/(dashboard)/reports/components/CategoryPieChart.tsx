'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, Sector } from 'recharts';
import { CategoryData } from '@/types/reports';

// Modern, vibrant palette – each color has a matching gradient
const COLORS = [
	'#6366f1',
	'#8b5cf6',
	'#a855f7',
	'#d946ef',
	'#ec4899',
	'#f43f5e',
	'#f97316',
	'#eab308',
	'#22c55e',
	'#14b8a6',
];

// Custom active shape that expands on hover (animated segment) – with safe coordinate handling
const ActiveShape = (props: any) => {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

	// Guard against invalid coordinates
	if (typeof cx !== 'number' || typeof cy !== 'number' || isNaN(cx) || isNaN(cy)) {
		return null;
	}

	// Calculate angle for the floating label
	const midAngle = (-startAngle + -endAngle) / 2;
	const angleRad = (midAngle * Math.PI) / 180;
	const radius = (outerRadius || 0) + 20;
	const labelX = cx + radius * Math.cos(angleRad);
	const labelY = cy + radius * Math.sin(angleRad);
	const isValidLabelPosition = !isNaN(labelX) && !isNaN(labelY);

	return (
		<g>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 8}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
				style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
			/>
			{/* Small indicator label – only if position is valid */}
			{isValidLabelPosition && (
				<text
					x={labelX}
					y={labelY}
					textAnchor="middle"
					dominantBaseline="central"
					fill="#e2e8f0"
					fontSize={13}
					fontWeight={600}
				>
					{`${payload.name} ${(percent * 100).toFixed(0)}%`}
				</text>
			)}
		</g>
	);
};

interface CategoryPieChartProps {
	data: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
	const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
	const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

	if (!data || data.length === 0) {
		return (
			<div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl p-8 h-80 flex items-center justify-center shadow-2xl">
				<p className="text-slate-400 text-sm">لا توجد مصروفات مسجلة</p>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl p-6 sm:p-8 transition-all duration-500 hover:shadow-2xl hover:border-slate-600/60 group">
			{/* Header with subtle shimmer effect */}
			<div className="relative mb-6">
				<h3 className="text-xl font-bold text-white flex items-center gap-3">
					<span className="text-2xl bg-white/10 p-1.5 rounded-xl backdrop-blur">📊</span>
					توزيع المصروفات
				</h3>
				<p className="text-slate-400 text-sm mt-1 mr-10">نظرة شاملة على إنفاقك</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
				{/* Chart area – takes 3 columns on large screens */}
				<div className="lg:col-span-3">
					<ResponsiveContainer width="100%" height={320}>
						<PieChart>
							{/* Define gradient fills */}
							<defs>
								{COLORS.map((color, idx) => (
									<linearGradient
										key={`gradient-${idx}`}
										id={`pieGradient-${idx}`}
										x1="0%"
										y1="0%"
										x2="100%"
										y2="100%"
									>
										<stop offset="0%" stopColor={color} stopOpacity={0.95} />
										<stop offset="100%" stopColor={color} stopOpacity={0.7} />
									</linearGradient>
								))}
							</defs>

							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								innerRadius={70}
								outerRadius={105}
								paddingAngle={4}
								cornerRadius={8}
								activeShape={ActiveShape}
								onMouseEnter={(_, idx) => setActiveIndex(idx)}
								onMouseLeave={() => setActiveIndex(undefined)}
								label={false}
								labelLine={false}
							>
								{data.map((_, idx) => (
									<Cell
										key={`cell-${idx}`}
										fill={`url(#pieGradient-${idx % COLORS.length})`}
										stroke="rgba(15,23,42,0.6)"
										strokeWidth={2}
									/>
								))}
								{/* Center total (always visible) */}
								<Label
									content={({ viewBox }) => {
										if (!viewBox) return null;
										const { cx, cy } = viewBox as { cx: number; cy: number };
										// Guard against NaN or undefined
										if (
											typeof cx !== 'number' ||
											typeof cy !== 'number' ||
											isNaN(cx) ||
											isNaN(cy)
										) {
											return null;
										}
										return (
											<g>
												<circle
													cx={cx}
													cy={cy}
													r={50}
													fill="rgba(15,23,42,0.5)"
													stroke="rgba(148,163,184,0.15)"
													strokeWidth={1}
												/>
												<text
													x={cx}
													y={cy - 12}
													textAnchor="middle"
													dominantBaseline="middle"
													className="fill-slate-300 text-xs font-medium"
												>
													الإجمالي
												</text>
												<text
													x={cx}
													y={cy + 14}
													textAnchor="middle"
													dominantBaseline="middle"
													className="fill-white text-xl font-bold"
												>
													{total.toLocaleString()}
												</text>
												<text
													x={cx}
													y={cy + 32}
													textAnchor="middle"
													dominantBaseline="middle"
													className="fill-slate-400 text-xs"
												>
													SYP
												</text>
											</g>
										);
									}}
									position="center"
								/>
							</Pie>

							<Tooltip
								formatter={(value: any) => {
									const num = Number(value) || 0;
									const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0';
									return [`${num.toLocaleString()} SYP (${pct}%)`, 'المبلغ'];
								}}
								contentStyle={{
									backgroundColor: 'rgba(15,23,42,0.95)',
									border: '1px solid rgba(99,102,241,0.4)',
									borderRadius: '16px',
									padding: '12px 16px',
									backdropFilter: 'blur(16px)',
									direction: 'rtl',
									boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
								}}
								labelStyle={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Custom Legend – takes 2 columns on large screens */}
				<div className="lg:col-span-2 space-y-3">
					<h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
						<span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
						تفاصيل الفئات
					</h4>
					{data.map((item, idx) => {
						const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
						return (
							<div
								key={item.name}
								className="flex items-center justify-between group/item cursor-pointer transition-all duration-200 hover:bg-white/5 rounded-lg p-2 -mr-2"
								onMouseEnter={() => setActiveIndex(idx)}
								onMouseLeave={() => setActiveIndex(undefined)}
							>
								<div className="flex items-center gap-3">
									<span
										className="w-3 h-3 rounded-full shadow-md"
										style={{ backgroundColor: COLORS[idx % COLORS.length] }}
									/>
									<span className="text-slate-300 text-sm font-medium">{item.name}</span>
								</div>
								<div className="flex items-center gap-3 text-xs">
									<span className="text-slate-400">{item.value.toLocaleString()} SYP</span>
									<span className="text-white bg-white/10 px-2 py-0.5 rounded-full font-semibold">
										{pct}%
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
