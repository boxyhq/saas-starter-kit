import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Trans, useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from 'types';
import type { ReactElement } from 'react';
import Link from 'next/link';

const Privacy: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('privacy-policy')}</title>
      </Head>
      <div className="container mx-auto px-4 py-10 prose">
        <h1>{t('privacy-policy')}</h1>
        <p>{t('privacy-paragraph-1')}</p>
        <Trans
          i18nKey="privacy-paragraph-2"
          components={{
            mailtoLink: <Link href="mailto:support@gdprcheck360.com" />,
          }}
        />
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

Privacy.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Privacy;
