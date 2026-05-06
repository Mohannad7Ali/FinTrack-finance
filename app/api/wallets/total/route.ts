// app/api/wallets/total/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// (يمكنك إعادة استخدام دوال loadExchangeRates و convertAmount من الملف السابق)
// لتجنب تكرار الكود، الأفضل وضع هذه الدوال في ملف lib/exchange-rates.ts
// لكن للاختصار، سأكررها هنا:

interface ExchangeRatesCache {
	rates: Record<string, number>;
	base: string;
	date: string;
	timestamp: number;
}
let cachedRates: ExchangeRatesCache | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function loadExchangeRates(): Promise<ExchangeRatesCache> {
	const now = Date.now();
	if (cachedRates && now - lastReadTime < CACHE_TTL_MS) return cachedRates;
	try {
		const filePath = path.join(process.cwd(), '.exchange-rates-cache.json');
		const content = await fs.readFile(filePath, 'utf-8');
		const data = JSON.parse(content);
		cachedRates = data;
		lastReadTime = now;
		return data;
	} catch (error) {
		return {
			rates: { USD: 1, SYP: 1, EUR: 1 },
			base: 'USD',
			date: new Date().toISOString(),
			timestamp: Date.now(),
		};
	}
}

function convertAmount(
	amount: number,
	from: string,
	to: string,
	rates: Record<string, number>
): number {
	if (from === to) return amount;
	const fromRate = rates[from];
	const toRate = rates[to];
	if (!fromRate || !toRate) return amount;
	return (amount / fromRate) * toRate;
}

export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferredCurrency: true },
		});
		const targetCurrency = user?.preferredCurrency || 'SYP';

		const wallets = await prisma.wallet.findMany({
			where: { userId },
			select: { balance: true, currency: true },
		});

		if (wallets.length === 0) {
			return NextResponse.json({ ok: true, total: 0, currency: targetCurrency });
		}

		const { rates } = await loadExchangeRates();
		let total = 0;
		for (const w of wallets) {
			const converted = convertAmount(Number(w.balance), w.currency, targetCurrency, rates);
			total += isNaN(converted) ? 0 : converted;
		}

		return NextResponse.json({
			ok: true,
			total: Number(total.toFixed(2)),
			currency: targetCurrency,
		});
	} catch (error) {
		console.error('[WALLETS_TOTAL_API]', error);
		return NextResponse.json({ ok: false, error: 'خطأ داخلي' }, { status: 500 });
	}
}
