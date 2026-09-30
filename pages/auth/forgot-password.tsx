import { type ReactElement } from 'react';
import { Recovery } from '@ory/elements-react/theme';
import { useRecoveryFlow } from '@ory/nextjs/pages';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Loading } from '@/components/shared';
import oryConfig from '@/lib/ory.config';

const ForgotPasswordPage: NextPageWithLayout = () => {
  const flow = useRecoveryFlow();

  if (!flow) {
    return <Loading />;
  }

  return <Recovery flow={flow} config={oryConfig} />;
};

ForgotPasswordPage.getLayout = function getLayout(page: ReactElement) {
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

export default ForgotPasswordPage;
