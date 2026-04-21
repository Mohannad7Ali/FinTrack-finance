// app/api/exchange-rates/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// مسار ملف التخزين المؤقت )
const CACHE_FILE = path.join(process.cwd(), '.exchange-rates-cache.json');

// مدة التخزين المؤقت بالمللي ثانية (6 ساعات = 21600000)
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

// واجهة بيانات التخزين المؤقت
interface CachedData {
	rates: Record<string, number>;
	base: string;
	date: string;
	timestamp: number; // وقت التخزين بالمللي ثانية
}

// دالة لقراءة البيانات المخزنة من الملف
async function readCacheFromFile(): Promise<CachedData | null> {
	try {
		const data = await fs.readFile(CACHE_FILE, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		// الملف غير موجود أو غير قابل للقراءة
		return null;
	}
}

// دالة لكتابة البيانات إلى الملف
async function writeCacheToFile(cache: CachedData): Promise<void> {
	try {
		await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
	} catch (error) {
		console.error('Failed to write cache file:', error);
	}
}

// دالة جلب البيانات من API السوري
async function fetchFromSyriaAPI(): Promise<CachedData | null> {
	try {
		const res = await fetch(
			'https://lirascope.syria-cloud.sy/api/v1/rates/latest?currencies=USD,EUR&lang=ar',
			{
				headers: { Accept: 'application/json' },
				// مهلة 10 ثوانٍ
				signal: AbortSignal.timeout(10000),
			}
		);

		if (!res.ok) throw new Error(`API error: ${res.status}`);
		const data = await res.json();

		const marketRates = data.marketRates || [];
		const usdRate = marketRates.find((r: any) => r.currency === 'USD');
		const eurRate = marketRates.find((r: any) => r.currency === 'EUR');

		if (!usdRate) throw new Error('USD rate not found');

		const sypPerUsd = usdRate.mid;
		const sypPerEur = eurRate ? eurRate.mid : sypPerUsd * 0.85; // احتياطي

		const rates = {
			USD: 1,
			SYP: sypPerUsd,
			EUR: sypPerEur / sypPerUsd,
		};

		return {
			rates,
			base: 'USD',
			date: new Date().toISOString(),
			timestamp: Date.now(),
		};
	} catch (error) {
		console.error('Error fetching from Syria API:', error);
		return null;
	}
}

export async function GET() {
	try {
		//  محاولة قراءة البيانات من الملف
		const cached = await readCacheFromFile();
		const now = Date.now();

		//  إذا كانت البيانات المخزنة لا تزال صالحة (لم تنته مدتها)
		if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
			return NextResponse.json({
				rates: cached.rates,
				base: cached.base,
				date: cached.date,
			});
		}

		//  انتهت صلاحية البيانات أو لا توجد بيانات، نحاول جلب بيانات جديدة
		const freshData = await fetchFromSyriaAPI();

		if (freshData) {
			// نجح الجلب – نخزن البيانات الجديدة ونعيدها
			await writeCacheToFile(freshData);
			return NextResponse.json({
				rates: freshData.rates,
				base: freshData.base,
				date: freshData.date,
			});
		}

		//  فشل الجلب ولكن لدينا بيانات مخزنة قديمة (حتى لو انتهت صلاحيتها)
		if (cached) {
			console.warn('Using stale cached data (API failed)');
			return NextResponse.json({
				rates: cached.rates,
				base: cached.base,
				date: cached.date,
				warning: 'using cached data',
			});
		}

		//  لا يوجد أي بيانات – نعيد بيانات افتراضية
		console.error('No data available, using fallback');
		return NextResponse.json({
			rates: { USD: 1, SYP: 13000, EUR: 0.85 },
			base: 'USD',
			date: new Date().toISOString(),
			warning: 'fallback data',
		});
	} catch (error) {
		console.error('Proxy critical error:', error);
		// محاولة إرجاع أي بيانات مخزنة حتى لو فشل كل شيء
		const cached = await readCacheFromFile();
		if (cached) {
			return NextResponse.json({
				rates: cached.rates,
				base: cached.base,
				date: cached.date,
			});
		}
		return NextResponse.json({ error: 'فشل جلب أسعار الصرف' }, { status: 500 });
	}
}
