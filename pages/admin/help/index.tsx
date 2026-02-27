import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import env from '@/lib/env';

export async function getServerSideProps({ req, res }: GetServerSidePropsContext) {
  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session) return { redirect: { destination: '/auth/login', permanent: false } };
  const adminEmails = env.adminEmails;
  if (!adminEmails?.includes((session.user as any)?.email)) return { redirect: { destination: '/', permanent: false } };
  return { redirect: { destination: '/admin/help/categories', permanent: false } };
}

export default function HelpRedirect() { return null; }
