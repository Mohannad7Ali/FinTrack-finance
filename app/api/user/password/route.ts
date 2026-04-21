// app/api/user/password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import { comparePasswords, hashPassword } from '@/lib/auth/utils';
import { z } from 'zod';

const passwordSchema = z.object({
	currentPassword: z.string().min(6),
	newPassword: z.string().min(6),
});

export async function PATCH(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}

		const body = await req.json();
		const parsed = passwordSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { passwordHash: true, provider: true },
		});

		if (!user || user.provider == 'google') {
			return NextResponse.json(
				{ ok: false, error: 'لا يمكن تغيير كلمة المرور لحسابات جوجل' },
				{ status: 400 }
			);
		}

		const isValid = await comparePasswords(parsed.data.currentPassword, user.passwordHash!);
		if (!isValid) {
			return NextResponse.json(
				{ ok: false, error: 'كلمة المرور الحالية غير صحيحة' },
				{ status: 401 }
			);
		}

		const newHash = await hashPassword(parsed.data.newPassword);
		await prisma.user.update({
			where: { id: userId },
			data: { passwordHash: newHash },
		});

		return NextResponse.json({ ok: true, message: 'تم تغيير كلمة المرور بنجاح' });
	} catch (error) {
		console.error('Password change error:', error);
		return NextResponse.json(
			{ ok: false, error: 'حدث خطأ أثناء تغيير كلمة المرور' },
			{ status: 500 }
		);
	}
}
