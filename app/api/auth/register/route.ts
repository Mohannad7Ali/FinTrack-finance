export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/auth/validators';
import { hashPassword, signJwt } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import { Prisma } from '@/lib/generated/prisma/client';

type RegisterResponse =
	| { ok: true; user: { id: number; name: string; email: string } }
	| { ok: false; error: string; issues?: any };

export async function POST(req: NextRequest) {
	try {
		//  Parse body safely
		const json = await req.json().catch(() => null);
		if (!json) {
			return NextResponse.json<RegisterResponse>(
				{ ok: false, error: 'طلب غير صالح' },
				{ status: 400 }
			);
		}

		//  Validate input
		const parsed = registerSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json<RegisterResponse>(
				{
					ok: false,
					error: 'البيانات المدخلة غير صحيحة',
					issues: parsed.error.flatten(),
				},
				{ status: 400 }
			);
		}

		const { name, email, password } = parsed.data;
		const normalizedEmail = email.toLowerCase().trim();
		const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
		if (existingEmail) {
			return NextResponse.json<RegisterResponse>({
				ok: false,
				error: 'هذا الايميل موجود مسبقاً! اذا قمت بانشاء حساب سابقاً بهذا الايميل قم بتسجيل الدخول',
			});
		}
		//  Hash password BEFORE transaction (performance)
		const passwordHash = await hashPassword(password);

		//  Create user (NO manual exists check )
		const newUser = await prisma.user.create({
			data: {
				name,
				email: normalizedEmail,
				passwordHash,
				wallets: {
					create: {
						name: 'المحفظة الرئيسية',
						balance: 0,
					},
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		//  Generate JWT (FIXED TYPE)
		const token = signJwt({
			sub: String(newUser.id),
			email: newUser.email,
		});

		//  Secure Cookie
		const cookieStore = await cookies();

		cookieStore.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax', // strict ممكن يكسر OAuth لاحقًا
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 days (match JWT)
		});

		return NextResponse.json<RegisterResponse>({
			ok: true,
			user: newUser,
		});
	} catch (err: unknown) {
		//  Prisma error handling (CRITICAL)
		if (err instanceof Prisma.PrismaClientKnownRequestError) {
			if (err.code === 'P2002') {
				return NextResponse.json<RegisterResponse>(
					{ ok: false, error: 'البريد الإلكتروني مستخدم مسبقاً' },
					{ status: 409 }
				);
			}
		}

		console.error('REGISTER_ERROR:', err);

		return NextResponse.json<RegisterResponse>(
			{ ok: false, error: 'حدث خطأ داخلي في الخادم' },
			{ status: 500 }
		);
	}
}
