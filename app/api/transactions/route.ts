'use client';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { transactionSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { getUserId } from '@/lib/utils/getUserId';
import { get } from 'http';
import { error } from 'console';
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
		// build dynamic where clause based on query parameters
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
		// تحسين الأداء: جلب الحقول المطلوبة فقط بدلاً من جلب كل شيء
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
		const parsed = transactionSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'بيانات غير صالحة. تأكد من الاسم والأيقونة.' },
				{ status: 400 }
			);
		}
		const { type, amount, occurredAt, description, categoryId, walletId } = parsed.data;
		const wallet = await prisma.wallet.findFirst({
			where: { id: walletId, userId },
		});
		if (!wallet) {
			return NextResponse.json(
				{ ok: false, error: 'المحفظة غير موجودة أو لا تملك صلاحية الوصول إليها' },
				{ status: 404 }
			);
		}
		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: { id: categoryId, OR: [{ userId }, { userId: null }] },
			});
			if (!category)
				return NextResponse.json({ ok: false, error: 'الفئة غير صالحة' }, { status: 400 });
		}
		//  تنفيذ العملية داخل Transaction لضمان سلامة البيانات (Atomic Operation)
		const result = await prisma.$transaction(async (trx) => {
			//verfiy expense
			if (type === 'EXPENSE') {
				const wallet = await prisma.wallet.findFirst({
					where: { id: walletId, userId },
				});
				if (Number(wallet?.balance) < amount) {
					return NextResponse.json({ ok: false, error: 'رصيد المحفظة غير كافي لصرف هذا المبلغ' });
				}
			}
			const newTransaction = await trx.transaction.create({
				data: {
					type,
					amount,
					occurredAt,
					description,
					categoryId,
					walletId,
					userId,
				},
			});
			// update amount
			const balanceChange = type === 'INCOME' ? amount : -amount;
			await trx.wallet.update({
				where: { id: walletId },
				data: { balance: { increment: balanceChange } },
			});
			return newTransaction;
		});
		return NextResponse.json({ ok: true, transaction: result });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ ok: false, error: 'بيانات الإدخال غير صالحة', details: error },
				{ status: 400 }
			);
		}

		console.error('[TRANSACTION_POST_ERROR]', error);
		return NextResponse.json({ ok: false, error: 'فشلت عملية إنشاء المعاملة' }, { status: 500 });
	}
}
