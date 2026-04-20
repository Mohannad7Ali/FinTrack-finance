// أنواع العملات المدعومة بشكل أساسي مع السماح بأي عملة أخرى كـ string
export type CurrencyCode =
	| 'USD'
	| 'EUR'
	| 'SYP'
	| 'GBP'
	| 'TRY'
	| 'AED'
	| 'SAR'
	| 'IQD'
	| 'JOD'
	| string;

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
