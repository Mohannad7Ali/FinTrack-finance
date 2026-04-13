export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth/utils';
import { getUserId } from '@/lib/utils/getUserId';
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) {
			return NextResponse.json({ ok: false, error: 'غير مصرح لك بالدخول' }, { status: 401 });
		}
		// جلب المحافظ مع ترتيبها
		// تحسين: يمكنك إضافة حقول محددة (Select) إذا كانت المحفظة تحتوي على بيانات ضخمة لا تحتاجها
		const wallets = await prisma.wallet.findMany({
			where: { userId },
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				balance: true,
				currency: true, // تأكد من وجود هذا الحقل في Schema الخاص بك
				createdAt: true,
			},
		});
		return NextResponse.json({ ok: true, wallets, count: wallets.length });
	} catch (err) {
		console.error('[WALLET_GET_ERROR]:', err);
		return NextResponse.json({ ok: false, error: 'Failed to fetch wallet data' }, { status: 500 });
	}
}
