import { type ReactElement } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';

const AuthErrorPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <div className="rounded p-6 border text-center space-y-4">
      <p className="text-sm text-gray-600">
        {t('something-went-wrong') ||
          'Something went wrong during authentication.'}
      </p>
      <Link href="/auth/login" className="btn btn-outline btn-primary w-full">
        {t('sign-in') || 'Back to sign in'}
      </Link>
    </div>
  );
};

AuthErrorPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default AuthErrorPage;
