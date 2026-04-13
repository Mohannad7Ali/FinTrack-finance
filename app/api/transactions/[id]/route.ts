export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { getUserId } from '@/lib/utils/getUserId';

type Params = { id: string };

export async function DELETE(req: NextRequest, context: { params: Promise<Params> }) {
	try {
		const { id } = await context.params;
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
		}
		const txId = parseInt(id);
		if (isNaN(txId)) {
			return NextResponse.json({ ok: false, error: 'Invalid ID format' }, { status: 400 });
		}
		// البحث عن المعاملة والتأكد من ملكيتها
		const existing = await prisma.transaction.findFirst({
			where: { id: txId, userId },
		});
		if (!existing) {
			return NextResponse.json({ ok: false, error: 'Transaction not found' }, { status: 404 });
		}
		//  تنفيذ الحذف وعكس الرصيد كعملية واحدة (Atomic Transaction)
		await prisma.$transaction(async (tx) => {
			// حساب القيمة التي يجب عكسها في الرصيد
			// إذا كانت "دخل" (INCOME) -> نطرحها من الرصيد
			// إذا كانت "مصروف" (EXPENSE) -> نضيفها للرصيد
			const revertAmount = existing.type === 'INCOME' ? -existing.amount : existing.amount;

			// حذف المعاملة أولاً
			await tx.transaction.delete({
				where: { id: existing.id },
			});

			// تحديث الرصيد في المحفظة
			// نستخدم updateMany مع userId لزيادة الأمان والتأكد من عدم العبث بمحافظ الغير
			await tx.wallet.update({
				where: { id: existing.walletId, userId },
				data: {
					balance: { increment: revertAmount },
				},
			});
		});

		return NextResponse.json({ ok: true, message: 'Transaction deleted and balance adjusted' });
	} catch (err) {
		console.error('[TRANSACTION_DELETE_ERROR]:', err);
		return NextResponse.json(
			{ ok: false, error: 'Failed to delete transaction safely' },
			{ status: 500 }
		);
	}
}
