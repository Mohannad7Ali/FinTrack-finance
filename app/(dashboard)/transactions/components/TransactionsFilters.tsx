'use client';

import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TransactionsFiltersProps {
	filterMonth: Date;
	setFilterMonth: (date: Date) => void;
	filterType: 'ALL' | 'INCOME' | 'EXPENSE';
	setFilterType: (type: 'ALL' | 'INCOME' | 'EXPENSE') => void;
	onAddNew: () => void;
}

export function TransactionsFilters({
	filterMonth,
	setFilterMonth,
	filterType,
	setFilterType,
	onAddNew,
}: TransactionsFiltersProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
			<div className="flex flex-wrap gap-3">
				{/* Month Picker */}
				<DatePicker
					value={filterMonth}
					onChange={(date) => {
						if (date) setFilterMonth(date.toDate());
					}}
					calendar={'gregorian' as any}
					format="MMMM YYYY"
					containerClassName="w-auto"
					render={(value, openCalendar) => (
						<Button variant="outline" className="border-white/20 text-white" onClick={openCalendar}>
							<CalendarIcon className="ml-2 h-4 w-4" />
							{value ? format(value, 'MMMM yyyy', { locale: ar }) : 'اختر الشهر'}
						</Button>
					)}
				/>

				{/* Type Filter */}
				<Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
					<TabsList className="bg-slate-800/50">
						<TabsTrigger value="ALL">الكل</TabsTrigger>
						<TabsTrigger value="INCOME">دخل</TabsTrigger>
						<TabsTrigger value="EXPENSE">مصروف</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<Button
				onClick={onAddNew}
				className="bg-emerald-600 hover:bg-emerald-500 text-xl font-bold text-white"
			>
				+ معاملة جديدة
			</Button>
		</div>
	);
}
