export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/utils/getUserId';
import { z } from 'zod';

const walletSchema = z.object({
	name: z.string().min(1).max(50),
	currency: z.string().length(3).default('SYP'),
	balance: z.number().optional().default(0),
});

export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const wallets = await prisma.wallet.findMany({
			where: { userId },
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				balance: true,
				currency: true,
				createdAt: true,
			},
		});
		return NextResponse.json({ ok: true, wallets });
	} catch (error) {
		console.error('GET /api/wallets error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح به' }, { status: 401 });
		}
		const body = await req.json();
		const parsed = walletSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ ok: false, error: 'اسم المحفظة أو العملة غير صالح' },
				{ status: 400 }
			);
		}
		const { name, currency, balance } = parsed.data;
		// التحقق من عدم وجود محفظة بنفس الاسم للمستخدم
		const existing = await prisma.wallet.findFirst({
			where: { userId, name: { equals: name, mode: 'insensitive' } },
		});
		if (existing) {
			return NextResponse.json(
				{ ok: false, error: 'يوجد محفظة بنفس الاسم مسبقاً' },
				{ status: 409 }
			);
		}
		const wallet = await prisma.wallet.create({
			data: {
				name: name.trim(),
				currency: currency.toUpperCase(),
				balance,
				userId,
			},
		});
		return NextResponse.json({ ok: true, wallet });
	} catch (error) {
		console.error('POST /api/wallets error:', error);
		return NextResponse.json({ ok: false, error: 'حدث خطأ في الخادم' }, { status: 500 });
	}
}
