// app/api/ai/financial-analysis/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import { openrouter } from '@/lib/openrouter';
import { FinancialAnalysisResponse } from '@/types/ai';

const CACHE_TTL_HOURS = 24;

export async function GET(req: NextRequest) {
	const timeoutController = new AbortController();
	const timeoutId = setTimeout(() => timeoutController.abort(), 30000);

	try {
		const rawUserId = await getUserId(req);
		if (!rawUserId) {
			return NextResponse.json<FinancialAnalysisResponse>(
				{ ok: false, error: 'غير مصرح به' },
				{ status: 401 }
			);
		}
		const userId = String(rawUserId);

		const { searchParams } = new URL(req.url);
		let months = parseInt(searchParams.get('months') || '6');
		if (isNaN(months) || months < 1) months = 6;
		if (months > 24) months = 24;

		const forceRefresh = searchParams.get('refresh') === 'true';

		// الكاش
		if (!forceRefresh) {
			const cached = await prisma.aiAnalysisCache.findUnique({ where: { userId } });
			if (cached) {
				const ageInHours = (Date.now() - new Date(cached.updatedAt).getTime()) / (1000 * 60 * 60);
				if (ageInHours < CACHE_TTL_HOURS) {
					return NextResponse.json<FinancialAnalysisResponse>({
						ok: true,
						data: cached.result as any,
						fromCache: true,
					});
				} else {
					await prisma.aiAnalysisCache.delete({ where: { userId } });
				}
			}
		}

		// جلب البيانات
		const startDate = new Date();
		startDate.setMonth(startDate.getMonth() - months);
		startDate.setUTCHours(0, 0, 0, 0);

		const [transactions, wallets] = await Promise.all([
			prisma.transaction.findMany({
				where: { userId: Number(userId), occurredAt: { gte: startDate } },
				select: {
					amount: true,
					type: true,
					occurredAt: true,
					category: { select: { name: true } },
				},
				orderBy: { occurredAt: 'asc' },
			}),
			prisma.wallet.findMany({
				where: { userId: Number(userId) },
				select: { name: true, balance: true, currency: true },
			}),
		]);

		const expenseTransactions = transactions.filter((tx) => tx.type === 'EXPENSE');
		if (expenseTransactions.length < 3) {
			const missing = 3 - expenseTransactions.length;
			return NextResponse.json<FinancialAnalysisResponse>({
				ok: true,
				data: {
					financial_health: 'بيانات غير كافية',
					spending_patterns: [],
					saving_opportunities: [],
					risk_alerts: [],
					raw_summary: `مرحباً! لتحليل سلوكك المالي بدقة، نحتاج إلى تسجيل ${missing} عملية صرف على الأقل. أضف بعض المصروفات ثم عد إلى هذه الصفحة.`,
					generated_at: new Date().toISOString(),
					isInsufficientData: true,
				},
			});
		}

		// حساب الإحصائيات
		let totalIncome = 0,
			totalExpense = 0;
		const spendingByCategory: Record<string, number> = {};
		for (const tx of transactions) {
			const amountNum = Number(tx.amount);
			if (tx.type === 'INCOME') totalIncome += amountNum;
			else {
				totalExpense += amountNum;
				const catName = tx.category?.name || 'أخرى';
				spendingByCategory[catName] = (spendingByCategory[catName] || 0) + amountNum;
			}
		}
		const balance = totalIncome - totalExpense;
		const topCategories = Object.entries(spendingByCategory)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([name, amount]) => ({ name, amount }));

		const prompt = `أنت خبير مالي. بناءً على بيانات المستخدم التالية (فترة ${months} أشهر)، قدم تحليلاً دقيقاً.

الدخل: ${totalIncome.toFixed(2)}
المصروفات: ${totalExpense.toFixed(2)}
صافي الادخار: ${balance.toFixed(2)}
عدد المعاملات: ${transactions.length}
عدد المحافظ: ${wallets.length}
أعلى 5 فئات إنفاق: ${topCategories.map((c) => `${c.name} (${c.amount.toFixed(2)})`).join(', ')}

أجب بصيغة JSON فقط:
{
  "financial_health": "تقييم (ممتاز/جيد/يحتاج تحسين/ضعيف) مع سبب مختصر",
  "spending_patterns": ["نمط إنفاق 1", "نمط 2", "نمط 3"],
  "saving_opportunities": ["فرصة توفير 1", "فرصة 2"],
  "risk_alerts": ["تنبيه 1"] أو [],
  "raw_summary": "فقرة نصائح عملية مفيدة"
}`;

		// ✅ إزالة response_format لأن بعض النماذج المجانية لا تدعمه
		const completion = await openrouter.chat.completions.create(
			{
				model: 'openrouter/free',
				messages: [
					{
						role: 'system',
						content:
							'أنت محلل مالي. ردك يكون بصيغة JSON صالحة فقط، بدون أي نصوص إضافية أو Markdown.',
					},
					{ role: 'user', content: prompt },
				],
				temperature: 0.4,
			},
			{ signal: timeoutController.signal }
		);

		clearTimeout(timeoutId);

		const rawContent = completion.choices[0]?.message?.content;
		if (!rawContent) throw new Error('لم يتلقَ الـ AI أي رد');

		// تنظيف قوي للاستجابة
		let cleaned = rawContent.trim();
		cleaned = cleaned
			.replace(/^```json\s*/, '')
			.replace(/^```\s*/, '')
			.replace(/```$/, '');
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		if (jsonMatch) cleaned = jsonMatch[0];
		const analysis = JSON.parse(cleaned);

		const safeAnalysis = {
			financial_health: analysis.financial_health || 'تحليل غير متوفر',
			spending_patterns: Array.isArray(analysis.spending_patterns)
				? analysis.spending_patterns
				: [],
			saving_opportunities: Array.isArray(analysis.saving_opportunities)
				? analysis.saving_opportunities
				: [],
			risk_alerts: Array.isArray(analysis.risk_alerts) ? analysis.risk_alerts : [],
			raw_summary: analysis.raw_summary || 'نوصي بإضافة المزيد من المعاملات للحصول على تحليل أفضل.',
			generated_at: new Date().toISOString(),
			isInsufficientData: false,
		};

		// حفظ الكاش
		await prisma.aiAnalysisCache.upsert({
			where: { userId },
			update: { result: safeAnalysis },
			create: { userId, result: safeAnalysis },
		});

		return NextResponse.json<FinancialAnalysisResponse>({ ok: true, data: safeAnalysis });
	} catch (error: any) {
		clearTimeout(timeoutId);
		console.error('[AI_ROUTE_ERROR]', error);
		let userMessage = 'حدث خطأ أثناء التحليل. حاول مرة أخرى.';
		if (error.name === 'AbortError')
			userMessage = 'استغرق الطلب وقتاً طويلاً. يرجى المحاولة لاحقاً.';
		else if (error.message?.includes('Provider returned error'))
			userMessage = 'مشكلة مؤقتة في مزود الخدمة. حاول لاحقاً.';
		return NextResponse.json<FinancialAnalysisResponse>(
			{ ok: false, error: userMessage },
			{ status: 500 }
		);
	}
}
