import { getCookie } from 'cookies-next';
import type { GetServerSidePropsContext } from 'next';

export const getParsedCookie = (
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res']
): {
  token: string | null;
  url: string | null;
} => {
  const cookie = getCookie('pending-invite', { req, res });

  return cookie
    ? JSON.parse(cookie as string)
    : {
        token: null,
        url: null,
      };
};
