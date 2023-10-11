import { AuthLayout } from '@/components/layouts';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactElement } from 'react';

const VerifyEmail = () => {
  return <></>;
};

VerifyEmail.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="confirm-email" description="confirm-email-description">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default VerifyEmail;
