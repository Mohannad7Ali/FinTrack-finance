import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================

// Static files (never run middleware)
const PUBLIC_FILE_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.ico', '.webp', '.avif'];

// Public pages (accessible without login)
const PUBLIC_PAGES = ['/login', '/register', '/recovery', '/maintenance'];

// Pages that should redirect to /dashboard if user is already authenticated
const AUTH_REDIRECT_PAGES = ['/', '/login', '/register', '/recovery'];

// Public API endpoints (no token required)
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/exchange-rates'];

// Protected pages (require authentication)
const PROTECTED_PAGES = [
	'/dashboard',
	'/categories',
	'/wallets',
	'/transactions',
	'/reports',
	'/settings',
	'/profile',
];

// Protected API endpoints (require token)
const PROTECTED_API_PREFIXES = [
	'/api/summary',
	'/api/transactions',
	'/api/wallets',
	'/api/categories',
	'/api/reports',
	'/api/settings',
	'/api/user/password',
	'/api/user/profile',
	'/api/user/upload-image',
];

// ============================================================
// 2. EDGE-COMPATIBLE JWT HELPER (no bcrypt, no node modules)
// ============================================================

/**
 * Decodes a JWT without verifying the signature (for expiry check only).
 * Returns null if token is malformed.
 */
function decodeJWT(token: string): null | { payload: any; expired: boolean } {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		// Decode the payload (second part)
		const payloadBase64 = parts[1];
		// Replace URL-safe characters and decode
		const normalizedBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
		const decoded = atob(normalizedBase64);
		const payload = JSON.parse(decoded);
		const exp = payload.exp;
		const now = Math.floor(Date.now() / 1000);
		const expired = exp ? now > exp : false;
		return { payload, expired };
	} catch (error) {
		return null;
	}
}

/**
 * Checks if a token is valid (exists and not expired)
 * Works in Edge Runtime – no native modules.
 */
function isTokenValid(token: string | undefined): boolean {
	if (!token) return false;
	const decoded = decodeJWT(token);
	if (!decoded) return false;
	return !decoded.expired;
}

// Helper: Check if pathname matches any pattern (with optional trailing slash)
function matchesAny(pathname: string, patterns: string[]): boolean {
	return patterns.some(
		(p) => pathname === p || pathname === `${p}/` || pathname.startsWith(`${p}/`)
	);
}

// ============================================================
// 3. MAIN MIDDLEWARE FUNCTION
// ============================================================

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// ----- Step 1: Ignore static files -----
	if (PUBLIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
		return NextResponse.next();
	}

	// ----- Step 2: Maintenance mode -----
	if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/maintenance') {
		return NextResponse.redirect(new URL('/maintenance', req.url));
	}

	// ----- Step 3: Token validation & cleanup -----
	const token = req.cookies.get('token')?.value;
	const isValid = isTokenValid(token);
	const isAuthenticated = isValid;
	const isTokenInvalid = !!token && !isValid;

	// If token exists but is invalid, delete the cookie immediately
	if (isTokenInvalid) {
		const response = NextResponse.next();
		response.cookies.delete('token');

		const isProtectedPath =
			matchesAny(pathname, PROTECTED_PAGES) || matchesAny(pathname, PROTECTED_API_PREFIXES);

		if (isProtectedPath) {
			if (matchesAny(pathname, PROTECTED_API_PREFIXES)) {
				return NextResponse.json({ ok: false, error: 'Invalid or expired token' }, { status: 401 });
			} else {
				const loginUrl = new URL('/login', req.url);
				loginUrl.searchParams.set('from', pathname);
				return NextResponse.redirect(loginUrl);
			}
		}
		return response;
	}

	// ----- Step 4: Determine route types -----
	const isPublicPage = matchesAny(pathname, PUBLIC_PAGES);
	const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
	const isAuthRedirectPage = matchesAny(pathname, AUTH_REDIRECT_PAGES);
	const isProtectedPage = matchesAny(pathname, PROTECTED_PAGES);
	const isProtectedApi = matchesAny(pathname, PROTECTED_API_PREFIXES);

	// ----- Step 5: Authenticated user trying to access auth pages or root -----
	if (isAuthenticated && isAuthRedirectPage) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// ----- Step 6: Unauthenticated user trying to access protected resources -----
	if (!isAuthenticated && (isProtectedPage || isProtectedApi)) {
		if (isProtectedApi) {
			return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
		}
		const loginUrl = new URL('/login', req.url);
		loginUrl.searchParams.set('from', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// ----- Step 7: Allow all other requests -----
	return NextResponse.next();
}

// ============================================================
// 4. MATCHER CONFIGURATION
// ============================================================

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
