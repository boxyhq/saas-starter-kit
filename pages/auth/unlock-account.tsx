import type { ReactElement } from 'react';
import type { GetServerSidePropsContext } from 'next';

import {
  deleteVerificationToken,
  getVerificationToken,
  isVerificationTokenExpired,
} from 'models/verificationToken';
import { unlockAccount } from '@/lib/accountLock';

const UnlockAccount = () => {
  return <></>;
};

UnlockAccount.getLayout = function getLayout(page: ReactElement) {
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

  const verificationToken = await getVerificationToken(token);

  if (!verificationToken) {
    return {
      redirect: {
        destination: '/auth/login?error=token-not-found',
        permanent: false,
      },
    };
  }

  if (isVerificationTokenExpired(verificationToken)) {
    return {
      redirect: {
        destination: '/auth/login?error=verify-account-expired',
        permanent: false,
      },
    };
  }

  await Promise.allSettled([
    unlockAccount(verificationToken.identifier),
    deleteVerificationToken(verificationToken.token),
  ]);

  return {
    redirect: {
      destination: '/auth/login?success=email-verified',
      permanent: false,
    },
  };
};

export default UnlockAccount;
