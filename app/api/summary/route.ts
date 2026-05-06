// app/api/summary/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// ========== دوال تحميل أسعار الصرف (نفس باقي الـ APIs) ==========
interface ExchangeRatesCache {
	rates: Record<string, number>;
	base: string;
	date: string;
	timestamp: number;
}

let cachedRates: ExchangeRatesCache | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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
		console.error('[SUMMARY_API] Rates file error, using fallback');
		return {
			rates: { USD: 1, SYP: 13000, EUR: 0.92, GBP: 0.79, TRY: 32, AED: 3.67, SAR: 3.75 },
			base: 'USD',
			date: new Date().toISOString(),
			timestamp: Date.now(),
		};
	}
}

function convertAmount(
	amount: number,
	sourceCurrency: string,
	targetCurrency: string,
	rates: Record<string, number>
): number {
	if (sourceCurrency === targetCurrency) return amount;
	const sourceRate = rates[sourceCurrency];
	const targetRate = rates[targetCurrency];
	if (!sourceRate || !targetRate) return amount;
	const inBase = amount / sourceRate;
	return inBase * targetRate;
}

// ========== API Handler ==========
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}

		// 1. العملة المفضلة للمستخدم
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferredCurrency: true },
		});
		const targetCurrency = user?.preferredCurrency || 'SYP';

		// 2. معاملات الشهر
		const { searchParams } = new URL(req.url);
		let month = parseInt(searchParams.get('month') || '');
		let year = parseInt(searchParams.get('year') || '');
		const now = new Date();
		if (isNaN(month)) month = now.getMonth() + 1;
		if (isNaN(year)) year = now.getFullYear();
		if (month < 1 || month > 12 || year < 1900) {
			return NextResponse.json({ ok: false, error: 'تاريخ غير صالح' }, { status: 400 });
		}

		const start = new Date(Date.UTC(year, month - 1, 1));
		const end = new Date(Date.UTC(year, month, 1));

		// 3. جلب جميع المعاملات مع المحافظ (للعملة)
		const allTransactions = await prisma.transaction.findMany({
			where: { userId, occurredAt: { gte: start, lt: end } },
			include: {
				category: { select: { id: true, name: true } },
				wallet: { select: { id: true, name: true, currency: true } },
			},
			orderBy: { occurredAt: 'desc' },
			take: 500, // حد أمان
		});

		if (allTransactions.length === 0) {
			return NextResponse.json({
				ok: true,
				summary: { income: 0, expense: 0, balance: 0 },
				charts: { categories: [], daily: [] },
				transaction: [], // مفرد كما تنتظره الصفحة
				preferredCurrency: targetCurrency,
			});
		}

		// 4. تحميل الأسعار
		const { rates } = await loadExchangeRates();

		// 5. تحويل المبالغ إلى العملة المفضلة
		const converted = allTransactions.map((tx) => {
			const sourceCurr = tx.wallet?.currency || 'SYP';
			const original = Number(tx.amount);
			const convertedAmount = convertAmount(original, sourceCurr, targetCurrency, rates);
			return { ...tx, convertedAmount };
		});

		// 6. تجميع البيانات
		let totalIncome = 0,
			totalExpense = 0;
		const expenseByCategory = new Map<string, number>();
		const dailyNet = new Map<number, number>();

		for (const tx of converted) {
			const amount = tx.convertedAmount;
			if (tx.type === 'INCOME') {
				totalIncome += amount;
			} else if (tx.type === 'EXPENSE') {
				totalExpense += amount;
				const catName = tx.category?.name || 'بدون فئة';
				expenseByCategory.set(catName, (expenseByCategory.get(catName) || 0) + amount);
			}
			const day = tx.occurredAt.getUTCDate();
			const netChange = tx.type === 'INCOME' ? amount : -amount;
			dailyNet.set(day, (dailyNet.get(day) || 0) + netChange);
		}

		const balance = totalIncome - totalExpense;

		// 7. تحضير البيانات للرسوم البيانية
		const categoriesChartData = Array.from(expenseByCategory.entries())
			.map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
			.sort((a, b) => b.value - a.value);

		const dailyChartData = Array.from(dailyNet.entries())
			.map(([day, value]) => ({ day, value: Number(value.toFixed(2)) }))
			.sort((a, b) => a.day - b.day);

		// 8. آخر 20 معاملة (مع الحقل المفرد)
		const recentTransactions = converted.slice(0, 20).map((tx) => ({
			id: tx.id,
			occurredAt: tx.occurredAt.toISOString(),
			description: tx.description,
			category: tx.category ? { id: tx.category.id, name: tx.category.name } : null,
			wallet: { id: tx.wallet!.id, name: tx.wallet!.name },
			amount: Number(tx.convertedAmount.toFixed(2)),
			type: tx.type,
		}));

		return NextResponse.json({
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
			transaction: recentTransactions, // ✅ مفرد كما تطلبه الصفحة
			preferredCurrency: targetCurrency,
		});
	} catch (error) {
		console.error('[SUMMARY_API_ERROR]', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ داخلي' }, { status: 500 });
	}
}
