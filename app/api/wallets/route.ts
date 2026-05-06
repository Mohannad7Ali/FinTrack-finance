// app/api/wallets/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/utils/getUserId';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// ========== دوال تحميل أسعار الصرف (نفس منطق `/api/summary`) ==========
interface ExchangeRatesCache {
	rates: Record<string, number>;
	base: string;
	date: string;
	timestamp: number;
}

let cachedRates: ExchangeRatesCache | null = null;
let lastReadTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // ساعة

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
		console.error('[WALLETS_API] Failed to load rates file, using fallback');
		// قيم افتراضية لتجنب تعطل التطبيق
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
	if (!sourceRate || !targetRate) {
		console.warn(
			`Missing rate for ${sourceCurrency} or ${targetCurrency}, returning original amount`
		);
		return amount;
	}
	const amountInBase = amount / sourceRate;
	return amountInBase * targetRate;
}

// ========== مخطط التحقق (نفس الموجود) ==========
const walletSchema = z.object({
	name: z.string().min(1).max(50),
	currency: z.string().length(3).default('SYP'),
	balance: z.number().optional().default(0),
});

// ========== GET – جلب المحافظ مع تحويل الأرصدة ==========
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}

		// 1. الحصول على العملة المفضلة للمستخدم
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { preferredCurrency: true },
		});
		const targetCurrency = user?.preferredCurrency || 'SYP';

		// 2. جلب المحافظ من قاعدة البيانات
		const wallets = await prisma.wallet.findMany({
			where: { userId },
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				balance: true,
				currency: true,
				createdAt: true,
			},
		});

		if (!wallets.length) {
			return NextResponse.json({
				ok: true,
				wallets: [],
				preferredCurrency: targetCurrency,
			});
		}

		// 3. تحميل أسعار الصرف
		const { rates } = await loadExchangeRates();

		// 4. إضافة الحقول المحولة
		const walletsWithConversion = wallets.map((wallet) => {
			const originalBalance = Number(wallet.balance);
			const convertedBalance = convertAmount(
				originalBalance,
				wallet.currency,
				targetCurrency,
				rates
			);
			return {
				id: wallet.id,
				name: wallet.name,
				originalBalance,
				convertedBalance: Number(convertedBalance.toFixed(2)),
				currency: wallet.currency,
				createdAt: wallet.createdAt,
			};
		});

		return NextResponse.json({
			ok: true,
			wallets: walletsWithConversion,
			preferredCurrency: targetCurrency,
		});
	} catch (error) {
		console.error('GET /api/wallets error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}

// ========== POST – إضافة محفظة جديدة (بدون تغيير) ==========
export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const body = await req.json();
		const parsed = walletSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'اسم المحفظة أو العملة غير صالح' },
				{ status: 400 }
			);
		}
		const { name, currency, balance } = parsed.data;
		// التحقق من عدم وجود محفظة بنفس الاسم للمستخدم
		const existing = await prisma.wallet.findFirst({
			where: { userId, name: { equals: name, mode: 'insensitive' } },
		});
		if (existing) {
			return NextResponse.json(
				{ ok: false, error: 'يوجد محفظة بنفس الاسم مسبقاً' },
				{ status: 409 }
			);
		}
		const wallet = await prisma.wallet.create({
			data: {
				name: name.trim(),
				currency: currency.toUpperCase(),
				balance,
				userId,
			},
		});
		return NextResponse.json({ ok: true, wallet });
	} catch (error) {
		console.error('POST /api/wallets error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}
