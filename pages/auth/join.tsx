import Link from 'next/link';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { type ReactElement, useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Join from '@/components/auth/Join';
import { getParsedCookie } from '@/lib/cookie';
import type { NextPageWithLayout } from 'types';
import { authProviderEnabled } from '@/lib/auth';
import { AuthLayout } from '@/components/layouts';
import { inferSSRProps } from '@/lib/inferSSRProps';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import JoinWithInvitation from '@/components/auth/JoinWithInvitation';

const Signup: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  inviteToken,
  next,
  authProviders,
}) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');

  const { error } = router.query;

  useEffect(() => {
    if (error) {
      toast.error(t(error));
    }
  }, [router.query]);

  if (status === 'authenticated') {
    router.push('/');
  }

  return (
    <>
			<Head>
				<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="robots" content="index, follow" />
				<meta name="keywords" content="Sign up to BoxyHQ's saas-starter-kit, saas-starter-kit, BoxyHQ saas-starter-kit signup page, Join saas-starter-kit, saas-starter-kit new user" />
				<meta name="description" content="Welcome to BoxyHQ's saas-starter-kit sign up page. Join BoxyHQ's saas-starter-kit by clicking on 'Continue to Github button' or by entering your email and password. Kickstart your enterprise app development with Next.js SaaS Starter Kit" />
				<title>Join BoxyHQ&apos;s Saas Starter Kit</title>
			</Head>

      <div className="rounded p-6 border">
        <div className="flex gap-2 flex-wrap">
          {authProviders.github && <GithubButton />}
          {authProviders.google && <GoogleButton />}
        </div>

        {(authProviders.github || authProviders.google) &&
          authProviders.credentials && <div className="divider">or</div>}

        {authProviders.credentials && (
          <>
            {inviteToken ? (
              <JoinWithInvitation inviteToken={inviteToken} next={next} />
            ) : (
              <Join />
            )}
          </>
        )}
      </div>
      <p className="text-center text-sm text-gray-600">
        {t('already-have-an-account')}
        <Link
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          &nbsp;{t('sign-in')}
        </Link>
      </p>
    </>
  );
};

Signup.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Create an account"
      description="Start your 30-day free trial"
    >
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res, locale }: GetServerSidePropsContext = context;

  const cookieParsed = getParsedCookie(req, res);

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      inviteToken: cookieParsed.token,
      next: cookieParsed.url ?? '/auth/login',
      authProviders: authProviderEnabled(),
    },
  };
};

export default Signup;
