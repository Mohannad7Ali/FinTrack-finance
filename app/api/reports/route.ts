// app/api/summary/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import { ReportsResponse } from '@/types/reports';
import fs from 'fs/promises';
import path from 'path';

// ------------------------------------------------------------
// 1. Read exchange rates from local JSON cache file
// ------------------------------------------------------------
interface ExchangeRatesCache {
	rates: Record<string, number>;
	base: string; // e.g., "USD"
	date: string;
	timestamp: number;
}

let cachedRates: ExchangeRatesCache | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // re-read file every hour (optional)

async function loadExchangeRates(): Promise<ExchangeRatesCache> {
	const now = Date.now();
	if (cachedRates && now - lastReadTime < CACHE_TTL_MS) {
		return cachedRates;
	}
	try {
		const filePath = path.join(process.cwd(), '.exchange-rates-cache.json');
		const fileContent = await fs.readFile(filePath, 'utf-8');
		const data = JSON.parse(fileContent) as ExchangeRatesCache;
		cachedRates = data;
		lastReadTime = now;
		return data;
	} catch (error) {
		console.error('[EXCHANGE_RATES] Failed to load rates file:', error);
		// Fallback to a default rates object (only SYP and USD, assume 1:1 for others)
		return {
			rates: { USD: 1, SYP: 1, EUR: 1 },
			base: 'USD',
			date: new Date().toISOString(),
			timestamp: Date.now(),
		};
	}
}

// Convert amount from sourceCurrency to targetCurrency using rates (base = USD)
function convertAmount(
	amount: number,
	sourceCurrency: string,
	targetCurrency: string,
	rates: Record<string, number>
): number {
	if (sourceCurrency === targetCurrency) return amount;
	const sourceRate = rates[sourceCurrency];
	const targetRate = rates[targetCurrency];
	if (!sourceRate || !targetRate) {
		console.warn(
			`Missing rate for ${sourceCurrency} or ${targetCurrency}, returning original amount`
		);
		return amount; // fallback
	}
	// Convert to base (USD) then to target
	const amountInBase = amount / sourceRate;
	return amountInBase * targetRate;
}

// ------------------------------------------------------------
// 2. Main API handler
// ------------------------------------------------------------
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json<ReportsResponse>(
				{ ok: false, error: 'غير مصرح به' },
				{ status: 401 }
			);
		}

		// 2.1 Get user's preferred currency
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferredCurrency: true },
		});
		const targetCurrency = user?.preferredCurrency || 'SYP';

		// 2.2 Parse month/year from query
		const { searchParams } = new URL(req.url);
		let month = parseInt(searchParams.get('month') || '');
		let year = parseInt(searchParams.get('year') || '');
		const now = new Date();
		if (isNaN(month)) month = now.getMonth() + 1;
		if (isNaN(year)) year = now.getFullYear();

		if (month < 1 || month > 12 || year < 1900 || year > 2100) {
			return NextResponse.json<ReportsResponse>(
				{ ok: false, error: 'قيم الشهر أو السنة غير صالحة' },
				{ status: 400 }
			);
		}

		const start = new Date(Date.UTC(year, month - 1, 1));
		const end = new Date(Date.UTC(year, month, 1));

		// 2.3 Fetch all transactions with their wallets (to get currency)
		const allTransactions = await prisma.transaction.findMany({
			where: { userId, occurredAt: { gte: start, lt: end } },
			include: {
				category: { select: { id: true, name: true } },
				wallet: { select: { id: true, name: true, currency: true } },
			},
		});

		if (allTransactions.length === 0) {
			return NextResponse.json<ReportsResponse>({
				ok: true,
				summary: { income: 0, expense: 0, balance: 0 },
				charts: { categories: [], daily: [] },
				transactions: [],
			});
		}

		// 2.4 Load exchange rates
		const exchangeData = await loadExchangeRates();
		const rates = exchangeData.rates;

		// 2.5 Convert all transaction amounts to targetCurrency
		const convertedTransactions = allTransactions.map((tx) => {
			const sourceCurrency = tx.wallet?.currency || 'SYP';
			const originalAmount = Number(tx.amount);
			const convertedAmount = convertAmount(originalAmount, sourceCurrency, targetCurrency, rates);
			return { ...tx, convertedAmount };
		});

		// 2.6 Aggregate: total income/expense, category breakdown, daily net
		let totalIncome = 0;
		let totalExpense = 0;
		const expenseByCategory = new Map<string, number>();
		const dailyNet = new Map<number, number>();

		for (const tx of convertedTransactions) {
			const amount = tx.convertedAmount;
			if (tx.type === 'INCOME') {
				totalIncome += amount;
			} else if (tx.type === 'EXPENSE') {
				totalExpense += amount;
				const catName = tx.category?.name || 'بدون فئة';
				expenseByCategory.set(catName, (expenseByCategory.get(catName) || 0) + amount);
			}
			// Daily net balance (income - expense)
			const day = tx.occurredAt.getUTCDate();
			const netChange = tx.type === 'INCOME' ? amount : -amount;
			dailyNet.set(day, (dailyNet.get(day) || 0) + netChange);
		}

		const balance = totalIncome - totalExpense;

		// 2.7 Prepare chart data
		const categoriesChartData = Array.from(expenseByCategory.entries())
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);

		const dailyChartData = Array.from(dailyNet.entries())
			.map(([day, value]) => ({ day, value: Number(value.toFixed(2)) }))
			.sort((a, b) => a.day - b.day);

		// 2.8 Last 20 transactions (converted)
		const recentTransactions = convertedTransactions
			.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
			.slice(0, 20)
			.map((tx) => ({
				id: tx.id,
				occurredAt: tx.occurredAt.toISOString(),
				description: tx.description,
				category: tx.category ? { id: tx.category.id, name: tx.category.name } : null,
				wallet: { id: tx.wallet!.id, name: tx.wallet!.name },
				amount: Number(tx.convertedAmount.toFixed(2)),
				type: tx.type,
			}));

		return NextResponse.json<ReportsResponse>({
			ok: true,
			summary: {
				income: Number(totalIncome.toFixed(2)),
				expense: Number(totalExpense.toFixed(2)),
				balance: Number(balance.toFixed(2)),
			},
			charts: {
				categories: categoriesChartData,
				daily: dailyChartData,
			},
			transactions: recentTransactions,
		});
	} catch (error) {
		console.error('[REPORTS_API_ERROR]', error);
		return NextResponse.json<ReportsResponse>(
			{ ok: false, error: 'حدث خطأ داخلي في السيرفر' },
			{ status: 500 }
		);
	}
}
