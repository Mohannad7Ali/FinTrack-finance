'use client';
import CategoryChart from '@/components/dashboard/CategoryChart';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';

export default function Dashboard() {
	return (
		<main className="flex flex-col min-h-screen items-center justify-between bg-slate-950 text-white">
			<h1 className="text-3xl font-bold">مرحباً بك في نظام إدارة مالية</h1>
			<SummaryCard title="any" value={456} color="emerlad" description="fsdgfhdkjsfh" />
			<br />
			<CategoryChart
				data={[
					{ name: 'Category 1', value: 5 },
					{ name: 'Category 2', value: 1 },
					{ name: 'Category 43', value: 15 },
					{ name: 'Category 4', value: 21 },
				]}
			/>
			<TransactionTable transactions={[]} onDelete={(id) => console.log(id)} />
		</main>
	);
}
