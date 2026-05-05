// types/ai.ts
export interface FinancialAnalysisResponse {
	ok: boolean;
	data?: {
		financial_health: string;
		spending_patterns: string[];
		saving_opportunities: string[];
		risk_alerts: string[];
		raw_summary: string;
		generated_at: string;
		isInsufficientData?: boolean;
	};
	error?: string;
	fromCache?: boolean;
}
