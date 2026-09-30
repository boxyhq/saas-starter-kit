import { type ReactElement } from 'react';
import { Login } from '@ory/elements-react/theme';
import { useLoginFlow } from '@ory/nextjs/pages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Loading } from '@/components/shared';
import oryConfig from '@/lib/ory.config';
import { authRedirect } from '@/lib/authRedirect';
import env from '@/lib/env';

const LoginPage: NextPageWithLayout = () => {
  const flow = useLoginFlow();
  const { t } = useTranslation('common');

  if (!flow) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Login flow={flow} config={oryConfig} />
      <Link
        href={{
          pathname: '/auth/sso',
          query: flow.return_to ? { return_to: flow.return_to } : {},
        }}
        className="btn btn-outline btn-sm w-full"
      >
        {t('continue-with-saml-sso') || 'Continue with SAML SSO'}
      </Link>
    </div>
  );
};

LoginPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async ({
  locale,
  query,
}: GetServerSidePropsContext) => {
  const redirect = authRedirect(query, '/auth/login', env.appUrl);
  if (redirect) return { redirect };
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default LoginPage;
