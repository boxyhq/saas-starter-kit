import GithubButton from '@/components/interfaces/Auth/GithubButton';
import GoogleButton from '@/components/interfaces/Auth/GoogleButton';
import Join from '@/components/interfaces/Auth/Join';
import JoinWithInvitation from '@/components/interfaces/Auth/JoinWithInvitation';
import { AuthLayout } from '@/components/layouts';
import { getParsedCookie } from '@/lib/cookie';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from 'types';

const Signup: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  inviteToken,
  next,
}) => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');

  if (status === 'authenticated') {
    router.push('/');
  }

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        {inviteToken ? (
          <JoinWithInvitation inviteToken={inviteToken} next={next} />
        ) : (
          <Join />
        )}
        <div className="divider">or</div>
        <div className="space-y-3">
          <GithubButton />
          <GoogleButton />
        </div>
      </div>

      <p className="text-center text-sm text-gray-600">
        {t('already-have-an-account')}
        <Link href="/auth/login">
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            &nbsp;{t('sign-in')}
          </a>
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
    },
  };
};

export default Signup;
