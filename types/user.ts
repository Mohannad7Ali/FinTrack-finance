export interface User {
	id: number;
	name: string;
	email: string;
	image?: string | null;
	preferredCurrency?: string;
	provider?: string | null;
}
