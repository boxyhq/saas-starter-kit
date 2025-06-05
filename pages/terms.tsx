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
        <p>{t('terms-paragraph-1')}</p>
        <p>{t('terms-paragraph-2')}</p>
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
