import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
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
        <p>
          GDPRcheck360 is committed to protecting your privacy. We process
          personal data solely to deliver and improve our services. Your
          information is never shared with third parties except as required by
          law.
        </p>
        <p>
          We collect only the data necessary to operate the platform and store
          it securely. If you have any questions about how we handle your data,
          please contact us at{' '}
          <Link href="mailto:support@gdprcheck360.com">
            support@gdprcheck360.com
          </Link>
          .
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

Privacy.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Privacy;
