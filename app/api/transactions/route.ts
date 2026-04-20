export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transactionApiSchema } from '@/lib/validators';
import { getUserId } from '@/lib/utils/getUserId';

export async function GET(req: NextRequest) {
	const userId = await getUserId(req);
	if (!userId || userId < 0) {
		return NextResponse.json(
			{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
			{ status: 401 }
		);
	}
	try {
		const url = new URL(req.url);
		const month = url.searchParams.get('month');
		const year = url.searchParams.get('year');
		const where: any = { userId };
		if (month && year) {
			const m = parseInt(month);
			const y = parseInt(year);
			if (isNaN(m) || isNaN(y)) {
				return NextResponse.json({ ok: false, error: 'تنسيق التاريخ غير صحيح' }, { status: 400 });
			}
			where.occurredAt = {
				gte: new Date(Date.UTC(y, m - 1, 1)),
				lt: new Date(Date.UTC(y, m, 1)),
			};
		}
		const transactions = await prisma.transaction.findMany({
			where,
			include: {
				category: { select: { id: true, name: true, icon: true } },
				wallet: { select: { id: true, name: true } },
			},
			orderBy: { occurredAt: 'desc' },
		});
		return NextResponse.json({ ok: true, transactions });
	} catch (error) {
		console.error('[TRANSACTIONS_GET_ERROR]', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const userId = await getUserId(req);
	if (!userId || userId < 0) {
		return NextResponse.json(
			{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
			{ status: 401 }
		);
	}
	try {
		const body = await req.json();
		const parsed = transactionApiSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'بيانات غير صالحة', details: parsed.error.message },
				{ status: 400 }
			);
		}
		const { type, amount, occurredAt, description, categoryId, walletId } = parsed.data;

		// التحقق من المحفظة
		const wallet = await prisma.wallet.findFirst({
			where: { id: walletId, userId },
		});
		if (!wallet) {
			return NextResponse.json(
				{ ok: false, error: 'المحفظة غير موجودة أو لا تملك صلاحية الوصول إليها' },
				{ status: 404 }
			);
		}
		// التحقق من الفئة
		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: { id: categoryId, OR: [{ userId }, { userId: null }] },
			});
			if (!category)
				return NextResponse.json({ ok: false, error: 'الفئة غير صالحة' }, { status: 400 });
		}

		const result = await prisma.$transaction(async (trx) => {
			if (type === 'EXPENSE') {
				const currentWallet = await trx.wallet.findFirst({
					where: { id: walletId, userId },
				});
				if (currentWallet && Number(currentWallet.balance) < amount) {
					throw new Error('INSUFFICIENT_BALANCE');
				}
			}
			const newTransaction = await trx.transaction.create({
				data: {
					type,
					amount,
					occurredAt: new Date(occurredAt),
					description,
					categoryId: categoryId || null,
					walletId,
					userId,
				},
			});
			const balanceChange = type === 'INCOME' ? amount : -amount;
			await trx.wallet.update({
				where: { id: walletId },
				data: { balance: { increment: balanceChange } },
			});
			return newTransaction;
		});

		return NextResponse.json({ ok: true, transaction: result });
	} catch (error: any) {
		if (error.message === 'INSUFFICIENT_BALANCE') {
			return NextResponse.json(
				{ ok: false, error: 'رصيد المحفظة غير كافي لصرف هذا المبلغ' },
				{ status: 400 }
			);
		}
		console.error('[TRANSACTION_POST_ERROR]', error);
		return NextResponse.json({ ok: false, error: 'فشلت عملية إنشاء المعاملة' }, { status: 500 });
	}
}
