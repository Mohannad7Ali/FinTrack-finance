export const runtime = 'nodejs';
import { verifyJwt } from '@/lib/auth/utils';
import { NextResponse, NextRequest } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غيرمصرح لك بالدخول' }, { status: 401 });
		}
		const { searchParams } = new URL(req.url);
		const month = parseInt(searchParams.get('month') || new Date(Date.now()).getMonth().toString());
		const year = parseInt(
			searchParams.get('year') || new Date(Date.now()).getFullYear().toString()
		);
		if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 1900) {
			return NextResponse.json({ ok: false, error: 'التاريخ المرسل غير صالح' }, { status: 400 });
		}
		const start = new Date(Date.UTC(year, month - 1, 1));
		const end = new Date(Date.UTC(year, month, 1));
		/**
		 * PERFORMANCE OPTIMIZATION: Use Prisma Transaction to run 4 queries in parallel
		 * This reduces database round trips from 4 to 1, significantly improving response time
		 */
		const [
			aggregatedAmountsByType, // Result 1: Total income/expense amounts grouped by type
			aggregatedExpensesByCategory, // Result 2: Expense totals grouped by category ID
			recentTransactions, // Result 3: Individual transactions with category info
			userCategories, // Result 4: All user categories for name lookup
		] = await prisma.$transaction([
			// QUERY 1: Calculate total income and expense for the month
			prisma.transaction.groupBy({
				by: ['type'],
				where: { userId, occurredAt: { gte: start, lt: end } },
				orderBy: undefined,
				_sum: { amount: true },
			}),
			// QUERY 2: Calculate expense distribution by category (for pie chart)
			prisma.transaction.groupBy({
				by: ['categoryId'],
				where: { userId, type: 'EXPENSE', occurredAt: { gte: start, lt: end } },
				orderBy: undefined,
				_sum: { amount: true },
			}),

			// QUERY 3: Get recent transactions for the transactions list
			// Includes category details (name, id) for display
			prisma.transaction.findMany({
				where: { userId, occurredAt: { gte: start, lt: end } },
				include: { category: { select: { id: true, name: true } } },
				orderBy: { occurredAt: 'desc' }, //latest first best for ui
				take: 500, // security check to ensure page not crash
			}),
			// QUERY 4: Get all user categories to map category IDs to names
			// Needed because groupBy queries don't support 'include' for relations
			prisma.category.findMany({
				select: { id: true, name: true },
			}),
		]);
		// PROCESS DATA FOR RESPONSE

		// Calculate summary statistics
		const totalIncome = Number(
			(aggregatedAmountsByType ?? []).find((a) => a.type === 'INCOME')?._sum?.amount ?? 0
		);
		const totalExpense = Number(
			(aggregatedAmountsByType ?? []).find((a) => a.type === 'EXPENSE')?._sum?.amount ?? 0
		);
		/**
		 * Build categories chart data (for pie/bar chart)
		 * Challenge: aggregatedExpensesByCategory has categoryId but no category name
		 * Solution: Join with userCategories to get names
		 */
		const categoriesChartData = aggregatedExpensesByCategory.map((expenseGroup) => {
			// Find the category name by matching ID
			const matchedCategory = userCategories.find((cat) => cat.id === expenseGroup.categoryId);
			const categoryName = matchedCategory ? matchedCategory.name : 'بدون فئة';
			return {
				name: categoryName,
				value: Number(expenseGroup?._sum?.amount ?? 0) || 0,
			};
		});
		/**
		 * Build daily balance chart data (for line/area chart)
		 * Calculate net balance (income - expense) for each day of the month
		 * balance = sum of (income - expense) for each day
		 */
		const dailyBalanceMap: Record<number, number> = {};
		recentTransactions.forEach((transaction) => {
			const day = transaction.occurredAt.getUTCDate(); // Get day of month (1-31)
			const amount = Number(transaction?.amount ?? 0);
			// Add amount for income, subtract for expense to get net balance
			const netChange = transaction.type === 'INCOME' ? amount : -amount;
			dailyBalanceMap[day] = (dailyBalanceMap[day] || 0) + netChange;
		});
		// Convert map to array format suitable for charts
		const dailyChartData = Object.entries(dailyBalanceMap)
			.map(([day, amount]) => ({
				day: parseInt(day),
				value: amount,
			}))
			.sort((a, b) => a.day - b.day); // Sort by day ascending for correct chart display
		//return complete dashboard data
		return NextResponse.json({
			ok: true,
			summary: {
				income: totalIncome,
				expense: totalExpense,
				balance: totalIncome - totalExpense,
			},
			charts: {
				categories: categoriesChartData, //expense breakdown by category
				daily: dailyChartData, // daily net balance trend
			},
			transaction: recentTransactions.map((tx) => ({
				...tx,
				amount: Number(tx.amount ?? 0), // convert decimal to number for json
			})),
		});
	} catch (e) {
		console.error('[DASHBOARD_GET_ERROR]', e);
		return NextResponse.json({ error: 'حدث خطأ داخلي في السيرفر' }, { status: 500 });
	}
}
