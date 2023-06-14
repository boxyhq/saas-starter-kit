import { ResetPasswordForm } from '@/components/interfaces/Auth/resetPasswordForm';
import { AuthLayout } from '@/components/layouts';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { NextPageWithLayout } from 'types';

const ResetPasswordPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { status } = useSession();
  const router = useRouter();

  return <ResetPasswordForm />;
};

ResetPasswordPage.getLayout = function getLayout(page: ReactElement) {
  const { t } = useTranslation('common');

  return (
    <AuthLayout
      heading={t('reset-password')}
      description={t('enter-new-password')}
    >
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

export default ResetPasswordPage;
