import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
if (!jwtSecret) {
	throw new Error('jwt secret undefined');
}
const JWT_EXPIRATION = '7d';

export interface AuthPayload extends JwtPayload {
	sub: string; //userid
	email?: string;
}

export function signJwt(payload: AuthPayload) {
	return jwt.sign(payload, jwtSecret as string, { expiresIn: JWT_EXPIRATION });
}

export function verifyJwt(token: string): AuthPayload | null {
	try {
		return jwt.verify(token, jwtSecret as string) as AuthPayload;
	} catch {
		return null;
	}
}

// Hashing and comparing passwords
export async function hashPassword(password: string): Promise<string> {
	const saltRounds = 12;
	return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(plain: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(plain, hash);
}
