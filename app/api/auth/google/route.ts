// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
	try {
		const { token } = await request.json();
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		if (!payload || !payload.email) {
			return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
		}
		const { email, name, picture, sub } = payload;

		let user = await prisma.user.findUnique({ where: { email } });

		// Create user if not exists, and also create a default wallet
		if (!user) {
			// Use transaction to ensure both user and wallet are created or none
			const result = await prisma.$transaction(async (tx) => {
				const newUser = await tx.user.create({
					data: {
						email,
						name: name || 'مستخدم',
						image: picture,
						provider: 'google',
						providerId: sub,
						// optional: if you have preferredCurrency field, add it with default 'SYP'
						// preferredCurrency: 'SYP',
					},
				});

				// Create default wallet with currency SYP (or any default)
				await tx.wallet.create({
					data: {
						name: 'المحفظة الرئيسية',
						balance: 0,
						currency: 'SYP', // default currency, you can change to USD/EUR
						userId: newUser.id,
					},
				});

				return newUser;
			});
			user = result;
		}

		const jwt = signJwt({ sub: String(user.id), email: user.email });
		const cookieStore = await cookies();
		cookieStore.set('token', jwt, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});
		return NextResponse.json({ ok: true, user });
	} catch (error) {
		console.error('Google auth error:', error);
		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
}
