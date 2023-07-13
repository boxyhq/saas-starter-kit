import micromatch from 'micromatch';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add routes that don't require authentication
const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/auth/**',
  '/api/oauth/**',
  '/api/scim/v2.0/**',
  '/auth/**',
  '/invitations/*',
  '/api/invitations/*',
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass routes that don't require authentication
  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
  });

  // No token, redirect to signin page
  if (!token) {
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('callbackUrl ', encodeURI(req.url));

    return NextResponse.redirect(url);
  }

  // All good, let the request through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
