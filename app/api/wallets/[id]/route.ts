export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/utils/getUserId';
import { z } from 'zod';

const updateWalletSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	currency: z.string().length(3).optional(),
	balance: z.number().optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const { id } = await context.params;
		const walletId = parseInt(id, 10);
		if (isNaN(walletId)) {
			return NextResponse.json({ ok: false, error: 'معرف غير صالح' }, { status: 400 });
		}
		const body = await req.json();
		const parsed = updateWalletSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ ok: false, error: 'بيانات غير صالحة' }, { status: 400 });
		}
		// التحقق من ملكية المحفظة
		const existing = await prisma.wallet.findFirst({
			where: { id: walletId, userId },
		});
		if (!existing) {
			return NextResponse.json(
				{ ok: false, error: 'المحفظة غير موجودة أو لا تخصك' },
				{ status: 404 }
			);
		}
		// إذا تم تغيير الاسم، نتحقق من عدم التكرار
		if (parsed.data.name && parsed.data.name !== existing.name) {
			const duplicate = await prisma.wallet.findFirst({
				where: { userId, name: parsed.data.name, id: { not: walletId } },
			});
			if (duplicate) {
				return NextResponse.json(
					{ ok: false, error: 'يوجد محفظة بنفس الاسم مسبقاً' },
					{ status: 409 }
				);
			}
		}
		const updated = await prisma.wallet.update({
			where: { id: walletId },
			data: {
				name: parsed.data.name?.trim(),
				currency: parsed.data.currency?.toUpperCase(),
				balance: parsed.data.balance,
			},
		});
		return NextResponse.json({ ok: true, wallet: updated });
	} catch (error) {
		console.error('PATCH /api/wallets/[id] error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const { id } = await context.params;
		const walletId = parseInt(id, 10);
		if (isNaN(walletId)) {
			return NextResponse.json({ ok: false, error: 'معرف غير صالح' }, { status: 400 });
		}
		// التحقق من وجود المحفظة وملكيتها
		const wallet = await prisma.wallet.findFirst({
			where: { id: walletId, userId },
			include: { transactions: { take: 1 } }, // نتحقق فقط من وجود معاملة واحدة
		});
		if (!wallet) {
			return NextResponse.json({ ok: false, error: 'المحفظة غير موجودة' }, { status: 404 });
		}
		if (wallet.transactions.length > 0) {
			return NextResponse.json(
				{
					ok: false,
					error: 'لا يمكن حذف المحفظة لأنها تحتوي على معاملات. قم بنقل المعاملات أو حذفها أولاً.',
				},
				{ status: 409 }
			);
		}
		await prisma.wallet.delete({ where: { id: walletId } });
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('DELETE /api/wallets/[id] error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}
