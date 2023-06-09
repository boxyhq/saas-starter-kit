export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/settings/:path*', '/teams/:path*', '/dashboard'],
};
