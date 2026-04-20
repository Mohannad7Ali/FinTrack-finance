// app/(dashboard)/reports/components/MonthYearPicker.tsx
'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';

const months = [
	'يناير',
	'فبراير',
	'مارس',
	'إبريل',
	'مايو',
	'يونيو',
	'يوليو',
	'أغسطس',
	'سبتمبر',
	'أكتوبر',
	'نوفمبر',
	'ديسمبر',
];

interface Props {
	month: number;
	year: number;
	onChange: (month: number, year: number) => void;
}

export default function MonthYearPicker({ month, year, onChange }: Props) {
	const handlePrev = () => {
		if (month === 1) onChange(12, year - 1);
		else onChange(month - 1, year);
	};
	const handleNext = () => {
		if (month === 12) onChange(1, year + 1);
		else onChange(month + 1, year);
	};

	return (
		<div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1.5 sm:p-2">
			<button onClick={handlePrev} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition">
				<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
			</button>
			<div className="flex gap-1 sm:gap-2">
				<select
					value={month}
					onChange={(e) => onChange(parseInt(e.target.value), year)}
					className="bg-slate-800 border border-white/20 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-white text-xs sm:text-sm"
				>
					{months.map((m, idx) => (
						<option key={idx} value={idx + 1}>
							{m}
						</option>
					))}
				</select>
				<select
					value={year}
					onChange={(e) => onChange(month, parseInt(e.target.value))}
					className="bg-slate-800 border border-white/20 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-white text-xs sm:text-sm"
				>
					{Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
						<option key={y} value={y}>
							{y}
						</option>
					))}
				</select>
			</div>
			<button onClick={handleNext} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition">
				<ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
			</button>
		</div>
	);
}
