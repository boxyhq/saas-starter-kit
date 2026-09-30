import micromatch from 'micromatch';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createOryMiddleware } from '@ory/nextjs/middleware';

import env from './lib/env';
import oryConfig from './lib/ory.config';

const orySdkUrl =
  process.env.ORY_SDK_URL ||
  process.env.NEXT_PUBLIC_ORY_SDK_URL ||
  'http://localhost:4433';

const oryMiddleware = createOryMiddleware(oryConfig);

const oryProxyPrefixes = [
  '/self-service',
  '/sessions',
  '/ui',
  '/.ory',
  '/.well-known/ory',
];

const SECURITY_HEADERS = {
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
} as const;

const generateCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'img-src': [
      "'self'",
      'boxyhq.com',
      '*.boxyhq.com',
      '*.dicebear.com',
      'data:',
    ],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      '*.gstatic.com',
      '*.google.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': [
      "'self'",
      orySdkUrl,
      '*.google.com',
      '*.gstatic.com',
      'boxyhq.com',
      '*.ingest.sentry.io',
      '*.mixpanel.com',
    ],
    'frame-src': ["'self'", '*.google.com', '*.gstatic.com'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", orySdkUrl],
    'frame-ancestors': ["'none'"],
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .concat(['upgrade-insecure-requests'])
    .join('; ');
};

const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/health',
  '/api/auth/**',
  '/api/oauth/**',
  '/api/scim/v2.0/**',
  '/api/invitations/*',
  '/api/webhooks/stripe',
  '/api/webhooks/dsync',
  '/auth/**',
  '/invitations/*',
  '/terms-condition',
  '/unlock-account',
  '/login/saml',
  '/.well-known/*',
  '/oauth/jwks',
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (oryProxyPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return oryMiddleware(req);
  }

  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  const redirectUrl = new URL('/auth/login', req.url);
  redirectUrl.searchParams.set('return_to', req.url);

  const cookie = req.headers.get('cookie') || '';
  let authenticated = false;

  if (cookie) {
    try {
      const response = await fetch(`${orySdkUrl}/sessions/whoami`, {
        headers: { cookie, accept: 'application/json' },
      });
      authenticated = response.ok;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(req.headers);
  const csp = generateCSP();

  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (env.securityHeadersEnabled) {
    response.headers.set('Content-Security-Policy', csp);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/session).*)'],
};
