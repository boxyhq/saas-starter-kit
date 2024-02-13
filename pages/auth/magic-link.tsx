import MagicLink from '@/components/auth/MagicLink';
import { AuthLayout } from '@/components/layouts';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getCsrfToken } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'types';

type LoginProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Login: NextPageWithLayout<LoginProps> = ({ csrfToken }) => {
  return <MagicLink csrfToken={csrfToken} />;
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(context),
    },
  };
};

export default Login;
