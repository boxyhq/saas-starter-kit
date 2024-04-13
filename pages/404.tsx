import React, { ReactElement } from 'react';
import { AccountLayout } from '@/components/layouts';
import { useTranslation } from 'react-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import router from 'next/router';

const Custom404 = () => {
  const { t } = useTranslation('common');
  return (
    <div className="w-full items-center justify-center lg:px-2 xl:px-0 text-center dark:bg-black">
      <p className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider dark:text-gray-300">
        {t('error-404')}
      </p>
      <p className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider dark:text-gray-300 mt-2">
        {t('page-not-found')}
      </p>
      <p className="text-lg md:text-xl lg:text-2xl dark:text-gray-500 my-12">
        {t('sorry-not-found')}
      </p>
      <div className="mt-8 space-x-5">
        <Link
          href="/"
          className="btn btn-primary btn-md py-3 px-2 sm:px-4 text-white"
        >
          {t('go-home')}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
          className="btn btn-primary dark:border-zinc-600 dark:border-2 dark:text-zinc-200 btn-outline py-3 px-2 sm:px-4 btn-md"
        >
          {t('go-back')}
        </button>
      </div>
    </div>
  );
};

export default Custom404;

Custom404.getLayout = function getLayout(page: ReactElement) {
  return <AccountLayout>{page}</AccountLayout>;
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}
