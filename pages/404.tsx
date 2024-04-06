// pages/404.tsx
import React, { ReactElement } from 'react';
import { AccountLayout } from '@/components/layouts';
import { useTranslation } from 'react-i18next'; // Import useTranslation from react-i18next
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function Custom404() {
  const { t } = useTranslation('common');
  return <h1>{t('error-404')}</h1>;
}

Custom404.getLayout = function getLayout(page: ReactElement) {
  return <AccountLayout>{page}</AccountLayout>;
};

export default Custom404;

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}
