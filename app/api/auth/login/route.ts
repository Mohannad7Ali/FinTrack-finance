export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/auth/validators';
import { comparePasswords, signJwt } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
type LoginResponse =
	| { ok: true; id: number; name: string; email: string }
	| { ok: false; error: string };

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const parsed = loginSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json<LoginResponse>(
				{ ok: false, error: 'بيانات غير صالحة' },
				{ status: 400 }
			);
		}
		const { email, password } = parsed.data;
		//fetch user
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				name: true,
				email: true,
				passwordHash: true,
				provider: true,
			},
		});
		if (!user) {
			return NextResponse.json<LoginResponse>(
				{ ok: false, error: 'بيانات تسجيل الدخول غير صحيحة' },
				{ status: 401 }
			);
		}
		//check password
		const isValid = await comparePasswords(parsed.data.password, String(user.passwordHash));
		if (!isValid) {
			return NextResponse.json<LoginResponse>(
				{ ok: false, error: 'بيانات تسجيل الدخول غير صحيحة' },
				{ status: 401 }
			);
		}
		//genrate token
		const token = signJwt({ sub: user.id.toString(), email: user.email });

		//set secure cookies
		const cookieStore = await cookies();
		cookieStore.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});
		// return success response
		return NextResponse.json<LoginResponse>({
			ok: true,
			id: user.id,
			name: user.name as string,
			email: user.email,
		});
	} catch {
		return NextResponse.json<LoginResponse>(
			{ ok: false, error: 'حدث خطأ غير متوقع' },
			{ status: 500 }
		);
	}
}
