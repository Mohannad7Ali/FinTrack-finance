import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/utils/getUserId';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
	name: z.string().min(2).optional(),
	preferredCurrency: z.string().length(3).optional(),
	image: z.string().url().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}

		const body = await req.json();
		const parsed = updateProfileSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ ok: false, error: 'بيانات غير صالحة' }, { status: 400 });
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: parsed.data,
			select: { id: true, name: true, email: true, image: true, preferredCurrency: true },
		});

		return NextResponse.json({ ok: true, user: updatedUser });
	} catch (error) {
		console.error('Profile update error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ أثناء التحديث' }, { status: 500 });
	}
}
