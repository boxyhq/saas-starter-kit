import { type ReactElement } from 'react';
import { SessionProvider } from '@ory/elements-react/client';
import { Settings } from '@ory/elements-react/theme';
import { useSettingsFlow } from '@ory/nextjs/pages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Loading } from '@/components/shared';
import oryConfig from '@/lib/ory.config';

const AuthSettingsPage: NextPageWithLayout = () => {
  const flow = useSettingsFlow();

  if (!flow) {
    return <Loading />;
  }

  return (
    <SessionProvider>
      <Settings flow={flow} config={oryConfig} />
    </SessionProvider>
  );
};

AuthSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
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

export default AuthSettingsPage;
