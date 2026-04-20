export type Transaction = {
	id: number;
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	occurredAt: string;
	description: string | null;
	category: { id: number; name: string; icon?: string } | null;
	wallet: { id: number; name: string };
};

export type Category = { id: number; name: string; icon?: string };
export type Wallet = { id: number; name: string; currency: string };
