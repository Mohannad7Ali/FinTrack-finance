export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/utils/getUserId';
import { transactionApiSchema } from '@/lib/validators';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await context.params;
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const txId = parseInt(id);
		if (isNaN(txId)) {
			return NextResponse.json({ ok: false, error: 'معرف غير صالح' }, { status: 400 });
		}

		const existing = await prisma.transaction.findFirst({
			where: { id: txId, userId },
		});
		if (!existing) {
			return NextResponse.json({ ok: false, error: 'المعاملة غير موجودة' }, { status: 404 });
		}

		await prisma.$transaction(async (tx) => {
			const amountNum = existing.amount.toNumber();
			const revertAmount = existing.type === 'INCOME' ? -amountNum : amountNum;

			await tx.transaction.delete({ where: { id: existing.id } });
			await tx.wallet.update({
				where: { id: existing.walletId, userId },
				data: { balance: { increment: revertAmount } },
			});
		});

		return NextResponse.json({ ok: true, message: 'تم حذف المعاملة وتحديث الرصيد' });
	} catch (err) {
		console.error('[TRANSACTION_DELETE_ERROR]:', err);
		return NextResponse.json({ ok: false, error: 'فشل حذف المعاملة' }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}

		const { id } = await context.params;
		const txId = parseInt(id, 10);
		if (isNaN(txId)) {
			return NextResponse.json({ ok: false, error: 'معرف غير صالح' }, { status: 400 });
		}

		const body = await req.json();
		const parsed = transactionApiSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'بيانات غير صالحة', details: parsed.error.message },
				{ status: 400 }
			);
		}

		const { type, amount, occurredAt, description, categoryId, walletId } = parsed.data;

		// 1. جلب المعاملة القديمة
		const oldTx = await prisma.transaction.findFirst({
			where: { id: txId, userId },
		});
		if (!oldTx) {
			return NextResponse.json({ ok: false, error: 'المعاملة غير موجودة' }, { status: 404 });
		}

		// 2. التحقق من المحفظة الجديدة
		const newWallet = await prisma.wallet.findFirst({
			where: { id: walletId, userId },
		});
		if (!newWallet) {
			return NextResponse.json({ ok: false, error: 'المحفظة غير موجودة' }, { status: 404 });
		}

		// 3. التحقق من الفئة (إذا وُجدت)
		if (categoryId) {
			const category = await prisma.category.findFirst({
				where: { id: categoryId, OR: [{ userId }, { userId: null }] },
			});
			if (!category) {
				return NextResponse.json({ ok: false, error: 'الفئة غير صالحة' }, { status: 400 });
			}
		}

		// 4. التحديث الذري (بدون التحقق من الرصيد)
		await prisma.$transaction(async (tx) => {
			const oldAmountNum = oldTx.amount.toNumber();
			// عكس تأثير المعاملة القديمة على رصيد المحفظة القديمة
			const oldBalanceChange = oldTx.type === 'INCOME' ? -oldAmountNum : oldAmountNum;
			await tx.wallet.update({
				where: { id: oldTx.walletId },
				data: { balance: { increment: oldBalanceChange } },
			});

			// تطبيق تأثير المعاملة الجديدة (يمكن أن يصبح الرصيد سالباً)
			const newBalanceChange = type === 'INCOME' ? amount : -amount;
			await tx.wallet.update({
				where: { id: walletId },
				data: { balance: { increment: newBalanceChange } },
			});

			// تحديث سجل المعاملة
			await tx.transaction.update({
				where: { id: txId },
				data: {
					type,
					amount,
					occurredAt: new Date(occurredAt),
					description,
					categoryId: categoryId || null,
					walletId,
				},
			});
		});

		return NextResponse.json({ ok: true });
	} catch (error: any) {
		console.error('[PATCH /api/transactions]', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ أثناء تعديل المعاملة' }, { status: 500 });
	}
}
