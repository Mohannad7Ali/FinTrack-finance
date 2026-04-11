'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts';
import { useState, useCallback } from 'react';

type Props = {
	data: { name: string; value: number }[];
};

const COLORS = ['#22c55e', '#0ea5e9', '#eab308', '#f97316', '#a855f7', '#ef4444', '#8b5cf6'];

const renderActiveShape = (props: any) => {
	const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
	return (
		<g>
			<Sector
				cx={cx}
				cy={cy}
				innerRadius={innerRadius}
				outerRadius={outerRadius + 3}
				startAngle={startAngle}
				endAngle={endAngle}
				fill={fill}
			/>
		</g>
	);
};

const CategoryChart = ({ data }: Props) => {
	const [activeIndex, setActiveIndex] = useState<number>(-1);

	const onPieEnter = useCallback((_: any, index: number) => {
		setActiveIndex(index);
	}, []);

	const onPieLeave = useCallback(() => {
		setActiveIndex(-1);
	}, []);

	if (!data || data.length === 0) {
		return (
			<div className="flex h-80 items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl">
				<p className="text-sm text-slate-400 font-medium">لا توجد بيانات للعرض</p>
			</div>
		);
	}

	return (
		<div className="h-[400px] w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-500 hover:bg-white/15">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						{...({
							activeIndex,
							activeShape: renderActiveShape,
							onMouseEnter: onPieEnter,
							onMouseLeave: onPieLeave,
						} as any)}
						data={data}
						dataKey="value"
						nameKey="name"
						cx="50%"
						cy="45%"
						innerRadius={75}
						outerRadius={120}
						paddingAngle={4}
						stroke="none"
					>
						{data.map((_, index) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
						))}
					</Pie>

					<Tooltip
						cursor={true}
						content={({ active, payload }) => {
							if (active && payload && payload.length) {
								return (
									<div className="bg-white p-3 shadow-xl rounded-xl border border-slate-50">
										<p className="font-bold text-slate-800 mb-1">{payload[0].name}</p>
										<p className="text-blue-600 font-bold" dir="ltr">
											{Number(payload[0].value).toLocaleString()}
										</p>
									</div>
								);
							}
							return null;
						}}
					/>

					<Legend
						verticalAlign="bottom"
						align="center"
						iconType="circle"
						formatter={(value) => (
							<span className="text-sm font-medium text-slate-600 px-2">{value}</span>
						)}
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};

export default CategoryChart;
