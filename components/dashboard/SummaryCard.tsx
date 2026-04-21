// components/dashboard/SummaryCard.tsx
'use client';

import { ReactNode } from 'react';

type SummaryCardProps = {
	title: string;
	value: number;
	color: 'emerald' | 'red';
	description?: string;
	icon?: ReactNode; // إضافة دعم للأيقونة
};

const SummaryCard = ({ title, value = 0, color, description, icon }: SummaryCardProps) => {
	const colorClass = color === 'emerald' ? 'text-emerald-500' : 'text-red-500';
	return (
		<div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/70">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-medium text-slate-200">{title}</h2>
				{icon && <div className="text-slate-400">{icon}</div>}
			</div>
			<p className={`text-2xl font-bold ${colorClass} mt-2`}>{value.toLocaleString()} SYP</p>
			{description && <p className="text-slate-400 text-[11px] mt-1">{description}</p>}
		</div>
	);
};

export default SummaryCard;
