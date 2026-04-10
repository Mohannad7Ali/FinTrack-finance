import { NextRequest } from 'next/server';
import { verifyJwt } from '../auth/utils';
// Helper function to extract user ID from JWT token securely

export async function getUserId(req: NextRequest) {
	// secure get user identity
	const token = req.cookies.get('token')?.value;
	if (!token) return;
	try {
		const payload = verifyJwt(token);
		return payload?.sub ? Number(payload.sub) : null;
	} catch {
		return null;
	}
}
