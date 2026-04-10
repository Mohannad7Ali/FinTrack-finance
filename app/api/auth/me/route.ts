import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth/utils';
import { prisma } from '@/lib/prisma';
type MeResponse =
	| { ok: true; userId?: number | null; name?: string; email?: string; authenticated?: boolean }
	| { ok: false; error?: string; authenticated?: boolean };

export async function GET() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('token')?.value;
		if (!token) {
			return NextResponse.json<MeResponse>({
				ok: true,
				authenticated: false,
				userId: null,
			});
		}
		const payload = verifyJwt(token);
		if (!payload || !payload.sub) {
			return NextResponse.json<MeResponse>({
				ok: true,
				authenticated: false,
				userId: null,
			});
		}
		const user = await prisma.user.findUnique({
			where: { id: parseInt(payload.sub) },
			select: { id: true, name: true, email: true },
		});
		if (!user) {
			return NextResponse.json<MeResponse>({
				ok: true,
				userId: null,
				authenticated: false,
			});
		}
		return NextResponse.json<MeResponse>({
			ok: true,
			authenticated: true,
			userId: user.id,
			name: user.name,
			email: user.email,
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'حدث خطأغير متوقع';
		return NextResponse.json<MeResponse>(
			{
				ok: false,
				error: message,
			},
			{ status: 500 }
		);
	}
}
