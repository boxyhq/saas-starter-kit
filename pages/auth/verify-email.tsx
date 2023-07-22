import { AuthLayout } from '@/components/layouts';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactElement } from 'react';

const VerifyEmail = () => {
  const { t } = useTranslation('common');

  return <></>

  return (
    <div className="rounded p-6 border">
      <div className="space-y-3 text-center">
        <h2>{t('confirm-email')}</h2>
        <p className="text-base text-gray-600">
          {t('confirm-email-description')}
        </p>
      </div>
    </div>
  );
};

VerifyEmail.getLayout = function getLayout(page: ReactElement) {
  const { t } = useTranslation('common');

  return (
    <AuthLayout
      heading={t('confirm-email')}
      description={t('confirm-email-description')}
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

export default VerifyEmail;
