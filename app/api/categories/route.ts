export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { categorySchema } from '@/lib/validators';
import { getUserId } from '@/lib/utils/getUserId';

export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId || userId < 0) {
			return NextResponse.json(
				{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
				{ status: 401 }
			);
		}
		const [defaultCategories, userCategories] = await Promise.all([
			prisma.category.findMany({
				where: { userId: null },
				orderBy: { name: 'asc' },
			}),
			prisma.category.findMany({
				where: { userId: userId },
				orderBy: { name: 'asc' },
			}),
		]);
		return NextResponse.json({
			ok: true,
			categories: [...defaultCategories, ...userCategories],
		});
	} catch (error) {
		console.error('❌ GET /api/categories error:', error);
		return NextResponse.json(
			{
				ok: false,
				error: 'حدث خطأ داخلي في الخادم. حاول مرة أخرى لاحقاً.',
			},
			{ status: 500 }
		);
	}
}
export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId || userId < 0) {
			return NextResponse.json(
				{ ok: false, error: 'غير مصرح به. يرجى تسجيل الدخول.' },
				{ status: 401 }
			);
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
		try {
			const cat = await prisma.category.create({
				data: {
					name: name.trim(),
					icon: icon?.trim() || null,
					userId,
				},
			});
			return NextResponse.json({ ok: true, categoria: cat });
		} catch (dbError: any) {
			if (dbError.code === 'p2002') {
				return NextResponse.json(
					{
						ok: false,
						error: 'فئة بنفس الاسم موجودة مسبقاً لهذا المستخدم.',
					},
					{ status: 409 }
				);
			}
			console.error('Database error in POST /api/categories:', dbError);
			return NextResponse.json(
				{ ok: false, error: 'حدث خطأ في قاعدة البيانات. حاول مرة أخرى.' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('❌ POST /api/categories unexpected error:', error);
		return NextResponse.json(
			{ ok: false, error: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' },
			{ status: 500 }
		);
	}
}
