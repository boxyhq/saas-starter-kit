export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/account/:path*', '/teams/:path*', '/dashboard'],
};
