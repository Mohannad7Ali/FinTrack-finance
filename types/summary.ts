export type Tx = {
	id: number;
	type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
	amount: number;
	occurredAt: string; // ISO date string
	description: string | null;
	category?: { id: number; name: string } | null;
	walletId: number;
};
// export type SummaryResponse = {
// 	ok: true;
// 	income: number;
// 	expense: number;
// 	balance: number;
// 	categoriesChart: { name: string; value: number }[];
// 	dailyChart: { day: number; value: number }[];
// 	transactions: Tx[];
// };
// types/summary.ts
export interface SummaryResponse {
	ok: boolean;
	summary: {
		income: number;
		expense: number;
		balance: number;
	};
	charts: {
		categories: { name: string; value: number }[];
		daily: { day: number; value: number }[];
	};
	transaction: any[]; // يمكن تحسينه باستخدام Transaction
}
