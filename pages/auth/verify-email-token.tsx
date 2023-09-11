import { prisma } from '@/lib/prisma';
import type { GetServerSidePropsContext } from 'next';
import type { ReactElement } from 'react';

const VerifyEmailToken = () => {
  return <></>;
};

VerifyEmailToken.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { token } = query as { token: string };

  if (!token) {
    return {
      notFound: true,
    };
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    return {
      redirect: {
        destination: '/auth/login?error=token-not-found',
        permanent: false,
      },
    };
  }

  if (new Date() > verificationToken.expires) {
    return {
      redirect: {
        destination: '/auth/resend-email-token?error=verify-account-expired',
        permanent: false,
      },
    };
  }

  await Promise.allSettled([
    prisma.user.update({
      where: {
        email: verificationToken?.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    }),

    prisma.verificationToken.delete({
      where: {
        token,
      },
    }),
  ]);

  return {
    redirect: {
      destination: '/auth/login?success=email-verified',
      permanent: false,
    },
  };
};

export default VerifyEmailToken;
