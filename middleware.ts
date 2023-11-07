import micromatch from 'micromatch';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add routes that don't require authentication
const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/health',
  '/api/auth/**',
  '/api/oauth/**',
  '/api/scim/v2.0/**',
  '/api/invitations/*',
  '/auth/**',
  '/invitations/*',
  '/terms-condition',
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log({ pathname });

  // Bypass routes that don't require authentication
  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  // Fetch session
  const session = await getSession(req);
  // console.log(JSON.stringify(session, null, 2));

  const redirectUrl = new URL('/auth/login', req.url);
  redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));

  if (!session) {
    return NextResponse.redirect(redirectUrl);
  }

  // const token = await getToken({
  //   req,
  // });

  // if (!token) {
  //   return NextResponse.redirect(redirectUrl);
  // }

  // All good, let the request through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/session).*)'],
};

const getSession = async (req: NextRequest) => {
  const url = new URL('/api/auth/session', req.url);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') || '',
    },
  });

  return await response.json();
};
