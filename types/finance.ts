// أنواع العملات المدعومة بشكل أساسي مع السماح بأي عملة أخرى كـ string
export type CurrencyCode = 'USD' | 'SYP' | 'EUR' | 'GOLD' | string;

export interface ExchangeData {
	rates: Record<string, number>;
	goldPrice: number;
	timestamp: number;
}

export interface FiatApiResponse {
	rates: Record<string, number>;
	base: string;
	date?: string;
}

export interface GoldApiResponse {
	price: string;
	currency: string;
}
