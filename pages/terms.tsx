import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from 'types';
import type { ReactElement } from 'react';

const Terms: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('terms-of-service')}</title>
      </Head>
      <div className="container mx-auto px-4 py-10 prose">
        <h1>{t('terms-of-service')}</h1>
        <p>
          By using GDPRcheck360 you agree to comply with these terms of service.
          You are responsible for ensuring that your use of the platform is in
          accordance with all applicable laws and regulations.
        </p>
        <p>
          We reserve the right to suspend or terminate access for activities
          that violate these terms. Your continued use of the service indicates
          acceptance of any updates to these terms.
        </p>
      </div>
    </>
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

Terms.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Terms;
