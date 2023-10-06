import Link from 'next/link';
import { type ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from 'types';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FAQSection from '@/components/defaultLanding/FAQSection';
import HeroSection from '@/components/defaultLanding/HeroSection';
import FeatureSection from '@/components/defaultLanding/FeatureSection';
import PricingSection from '@/components/defaultLanding/PricingSection';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';

const Home: NextPageWithLayout = () => {
  const { toggleTheme, selectedTheme } = useTheme();

  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <Link href="/" className="btn-ghost btn text-xl normal-case">
            BoxyHQ
          </Link>
        </div>
        <div className="flex-none">
          <div className="menu menu-horizontal flex items-center gap-2 sm:gap-4">
            <button
              className=""
              onClick={toggleTheme}
            >
              <selectedTheme.icon className="w-5 h-5" />
            </button>
            <Link
              href="/auth/join"
              className="btn btn-primary p-2 sm:px-[16px] text-white"
            >
              {t('sign-up')}
            </Link>
            <Link
              href="/auth/login"
              className="btn btn-primary p-2 sm:px-[16px] btn-outline"
            >
              {t('sign-in')}
            </Link>
          </div>
        </div>
      </div>
      <HeroSection />
      <div className="divider"></div>
      <FeatureSection />
      <div className="divider"></div>
      <PricingSection />
      <div className="divider"></div>
      <FAQSection />
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Redirect to login page if landing page is disabled
  if (env.hideLandingPage) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: true,
      },
    }
  }

  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
