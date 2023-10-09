import Link from 'next/link';
import Head from 'next/head';
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
		<>
			<Head>
				<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="robots" content="index, follow" />
				<meta name="keywords" content="BoxyHQ's saas-starter-kit, saas-starter-kit, BoxyHQ saas-starter-kit, NextJS saas-starter-kit" />
				<meta name="description" content="Welcome to BoxyHQ's saas-starter-kit. Kickstart your enterprise app development with Next.js SaaS Starter Kit" />
				<title>BoxyHQ's Saas Starter Kit</title>
			</Head>

			<div className="container mx-auto">
				<div className="navbar bg-base-100 px-0 sm:px-1">
					<div className="flex-1">
						<Link href="/" className="btn-ghost btn text-xl normal-case">
							BoxyHQ
						</Link>
					</div>
					<div className="flex-none">
						<ul className="menu menu-horizontal flex items-center gap-2 sm:gap-4">
							<li>
								<button
									className="bg-none p-0 rounded-lg flex items-center justify-center"
									onClick={toggleTheme}
								>
									<selectedTheme.icon className="w-5 h-5" />
								</button>
							</li>
							<li>
								<Link
									href="/auth/join"
									className="btn btn-primary btn-md px-2 sm:px-4 text-white"
								>
									{t('sign-up')}
								</Link>
							</li>
							<li>
								<Link
									href="/auth/login"
									className="btn btn-primary btn-outline px-2 sm:px-4 btn-md"
								>
									{t('sign-in')}
								</Link>
							</li>
						</ul>
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
		</>
	);
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Redirect to login page if landing page is disabled
  if(env.hideLandingPage) {
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
