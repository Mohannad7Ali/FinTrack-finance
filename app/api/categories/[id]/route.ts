export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { getUserId } from '@/lib/utils/getUserId';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json(
				{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
				{ status: 401 }
			);
		}
		const { id } = await context.params;
		const categoryId = parseInt(id, 10);
		if (isNaN(categoryId) || !Number.isInteger(categoryId) || categoryId <= 0) {
			return NextResponse.json({ ok: false, error: 'معرف الفئة غير صالح.' }, { status: 400 });
		}
		await prisma.$transaction(async (trx) => {
			const category = await trx.category.findUnique({ where: { id: categoryId } });
			if (!category || (category.userId !== null && category.userId !== userId)) {
				throw new Error('NOT_FOUND_OR_UNAUTHORIZED');
			}
			// منع حذف الفئات العامة (userId === null)
			if (category.userId === null) {
				throw new Error('CANNOT_DELETE_DEFAULT_CATEGORY');
			}
			await trx.transaction.updateMany({
				where: { userId, categoryId },
				data: { categoryId: null },
			});
		});
		return NextResponse.json({ ok: true });
	} catch (error: any) {
		// أخطاء متوقعة من المعاملة
		if (error.message === 'NOT_FOUND_OR_UNAUTHORIZED') {
			return NextResponse.json(
				{ ok: false, error: 'الفئة غير موجودة أو لا تخص المستخدم.' },
				{ status: 404 }
			);
		}
		if (error.message === 'CANNOT_DELETE_DEFAULT_CATEGORY') {
			return NextResponse.json(
				{ ok: false, error: 'لا يمكن حذف الفئات العامة (الافتراضية).' },
				{ status: 403 }
			);
		}

		// أخطاء Prisma المعروفة
		if (error.code === 'P2025') {
			// السجل المراد حذفه غير موجود (قد يكون تم حذفه قبل المعاملة)
			return NextResponse.json({ ok: false, error: 'الفئة غير موجودة.' }, { status: 404 });
		}

		// أي خطأ آخر غير متوقع
		console.error('❌ DELETE /api/categories/[id] unexpected error:', error);
		return NextResponse.json(
			{ ok: false, error: 'حدث خطأ داخلي في الخادم. حاول مرة أخرى لاحقاً.' },
			{ status: 500 }
		);
	}
}
