import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { generateToken } from '@/lib/common';
import { prisma } from '@/lib/prisma';
import type { GetServerSidePropsContext } from 'next';
import type { ReactElement } from 'react';
import { User } from '@prisma/client';

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
    // // Delete old token
    // prisma.verificationToken.delete({
    //   where: {
    //     token,
    //   },
    // });

    // // create a new one
    // const user = (await prisma.user.findFirst({
    //   where: {
    //     email: verificationToken.identifier,
    //   },
    // })) as User;

    // const newVerificationToken = await prisma.verificationToken.create({
    //   data: {
    //     identifier: verificationToken.identifier,
    //     token: generateToken(),
    //     expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    //   },
    // });

    // // resend verification email
    // await sendVerificationEmail({
    //   user,
    //   verificationToken: newVerificationToken,
    // });
    return {
      redirect: {
        destination: '/auth/verify-account?error=verify-account-expired',
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
