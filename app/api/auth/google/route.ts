import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwt } from '@/lib/auth/utils';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';
import Image from 'next/image';

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
		// create use if not exists
		if (!user) {
			user = await prisma.user.create({
				data: {
					email,
					name: name || 'مستخدم',
					image: picture,
					provider: 'google',
					providerId: sub,
				},
			});
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
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 });
	}
}
