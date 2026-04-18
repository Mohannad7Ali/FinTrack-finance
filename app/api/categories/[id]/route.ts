export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { getUserId } from '@/lib/utils/getUserId';
import { categorySchema } from '@/lib/validators';

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
			await trx.category.delete({ where: { id: categoryId } });
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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const userId = await getUserId(req);
		if (!userId || userId < 0) {
			return NextResponse.json(
				{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
				{ status: 401 }
			);
		}

		const { id } = await context.params;
		const categoryId = parseInt(id, 10);
		if (isNaN(categoryId) || categoryId <= 0) {
			return NextResponse.json({ ok: false, error: 'معرف الفئة غير صالح.' }, { status: 400 });
		}

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json(
				{ ok: false, error: 'البيانات المرسلة غير صالحة (JSON غير صحيح).' },
				{ status: 400 }
			);
		}

		const parsed = categorySchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'بيانات غير صالحة. تأكد من الاسم والأيقونة.' },
				{ status: 400 }
			);
		}

		const { name, icon } = parsed.data;

		// التحقق من ملكية الفئة وعدم كونها عامة
		const existingCategory = await prisma.category.findUnique({
			where: { id: categoryId },
		});

		if (!existingCategory) {
			return NextResponse.json({ ok: false, error: 'الفئة غير موجودة.' }, { status: 404 });
		}

		if (existingCategory.userId === null) {
			return NextResponse.json(
				{ ok: false, error: 'لا يمكن تعديل الفئات العامة.' },
				{ status: 403 }
			);
		}

		if (existingCategory.userId !== userId) {
			return NextResponse.json(
				{ ok: false, error: 'غير مصرح لك بتعديل هذه الفئة.' },
				{ status: 403 }
			);
		}

		// محاولة التحديث
		try {
			const updated = await prisma.category.update({
				where: { id: categoryId },
				data: {
					name: name.trim(),
					icon: icon?.trim() || null,
				},
			});
			return NextResponse.json({ ok: true, category: updated });
		} catch (dbError: any) {
			if (dbError.code === 'P2002') {
				return NextResponse.json(
					{ ok: false, error: 'فئة بنفس الاسم موجودة مسبقاً لهذا المستخدم.' },
					{ status: 409 }
				);
			}
			console.error('DB error in PATCH /api/categories/[id]:', dbError);
			return NextResponse.json({ ok: false, error: 'حدث خطأ في قاعدة البيانات.' }, { status: 500 });
		}
	} catch (error) {
		console.error('❌ PATCH /api/categories/[id] error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ داخلي.' }, { status: 500 });
	}
}
