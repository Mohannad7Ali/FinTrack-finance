// types/reports.ts
import { TxType } from '@prisma/client';
export interface ReportSummary {
	income: number;
	expense: number;
	balance: number;
}

export interface CategoryData {
	name: string;
	value: number;
}

export interface DailyData {
	day: number;
	value: number;
}

export interface ReportTransaction {
	id: number;
	occurredAt: string; // ISO date
	description: string | null;
	category: { id: number; name: string } | null;
	wallet: { id: number; name: string };
	amount: number;
	type: TxType;
}

export interface ReportsResponse {
	ok: boolean;
	summary?: ReportSummary;
	charts?: {
		categories: CategoryData[];
		daily: DailyData[];
	};
	transactions?: ReportTransaction[];
	error?: string;
}
