// app/api/summary/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import { ReportsResponse } from '@/types/reports';

export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json<ReportsResponse>(
				{ ok: false, error: 'غير مصرح به' },
				{ status: 401 }
			);
		}

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

		const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
		const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

		// استعلامات متوازية
		const [incomeAgg, expenseAgg, expenseTransactions, dailyTransactions, recentTransactions] =
			await Promise.all([
				prisma.transaction.aggregate({
					where: { userId, type: 'INCOME', occurredAt: { gte: start, lt: end } },
					_sum: { amount: true },
				}),
				prisma.transaction.aggregate({
					where: { userId, type: 'EXPENSE', occurredAt: { gte: start, lt: end } },
					_sum: { amount: true },
				}),
				prisma.transaction.findMany({
					where: { userId, type: 'EXPENSE', occurredAt: { gte: start, lt: end } },
					include: { category: { select: { id: true, name: true } } },
				}),
				prisma.transaction.findMany({
					where: { userId, occurredAt: { gte: start, lt: end } },
					select: { occurredAt: true, type: true, amount: true },
				}),
				prisma.transaction.findMany({
					where: { userId, occurredAt: { gte: start, lt: end } },
					include: {
						category: { select: { id: true, name: true } },
						wallet: { select: { id: true, name: true } },
					},
					orderBy: { occurredAt: 'desc' },
					take: 20,
				}),
			]);

		const totalIncome = Number(incomeAgg._sum.amount || 0);
		const totalExpense = Number(expenseAgg._sum.amount || 0);
		const balance = totalIncome - totalExpense;

		// تجميع المصروفات حسب اسم الفئة (بدون groupBy)
		const expenseMap = new Map<string, number>();
		for (const tx of expenseTransactions) {
			const categoryName = tx.category?.name || 'بدون فئة';
			const amount = Number(tx.amount);
			expenseMap.set(categoryName, (expenseMap.get(categoryName) || 0) + amount);
		}
		const categoriesChartData = Array.from(expenseMap.entries()).map(([name, value]) => ({
			name,
			value,
		}));

		// حساب الصافي اليومي
		const dailyMap = new Map<number, number>();
		for (const tx of dailyTransactions) {
			const day = tx.occurredAt.getUTCDate();
			const amountNum = Number(tx.amount);
			const change = tx.type === 'INCOME' ? amountNum : -amountNum;
			dailyMap.set(day, (dailyMap.get(day) || 0) + change);
		}
		const dailyChartData = Array.from(dailyMap.entries())
			.map(([day, value]) => ({ day, value }))
			.sort((a, b) => a.day - b.day);

		const formattedTransactions = recentTransactions.map((tx) => ({
			id: tx.id,
			occurredAt: tx.occurredAt.toISOString(),
			description: tx.description,
			category: tx.category ? { id: tx.category.id, name: tx.category.name } : null,
			wallet: { id: tx.wallet.id, name: tx.wallet.name },
			amount: Number(tx.amount),
			type: tx.type,
		}));

		const response: ReportsResponse = {
			ok: true,
			summary: { income: totalIncome, expense: totalExpense, balance },
			charts: {
				categories: categoriesChartData,
				daily: dailyChartData,
			},
			transactions: formattedTransactions,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('[REPORTS_API_ERROR]', error);
		return NextResponse.json<ReportsResponse>(
			{ ok: false, error: 'حدث خطأ داخلي في السيرفر' },
			{ status: 500 }
		);
	}
}
