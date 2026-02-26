import { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';

/**
 * Internal page that validates an impersonation token and redirects to /teams.
 * The impersonation token is stored in the NextAuth session via a custom callback.
 */
const ImpersonateStartPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Starting impersonation session…</p>
    </div>
  );
};

export async function getServerSideProps({ req, res, query }: GetServerSidePropsContext) {
  const { token } = query as { token: string };
  if (!token) return { redirect: { destination: '/admin', permanent: false } };

  const session = await getServerSession(req, res, getAuthOptions(req, res));
  if (!session?.user?.id) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }

  // Validate impersonation record
  const record = await prisma.adminImpersonation.findUnique({
    where: { token },
    select: {
      id: true,
      adminUserId: true,
      targetUserId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { redirect: { destination: '/admin?error=invalid_impersonation_token', permanent: false } };
  }

  // Verify this admin matches
  if (record.adminUserId !== session.user.id) {
    return { redirect: { destination: '/admin?error=impersonation_forbidden', permanent: false } };
  }

  // Mark as used
  await prisma.adminImpersonation.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // The actual session switching would require a custom NextAuth provider or
  // a server-side session store. For now, store the token in a cookie and
  // redirect — the NextAuth callbacks can read this and switch the session.
  res.setHeader('Set-Cookie', `admin_impersonation_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);

  return { redirect: { destination: '/teams', permanent: false } };
}

export default ImpersonateStartPage;
