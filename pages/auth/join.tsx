import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import Join from '@/components/auth/Join';
import JoinWithInvitation from '@/components/auth/JoinWithInvitation';
import { AuthLayout } from '@/components/layouts';
import { getParsedCookie } from '@/lib/cookie';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';

const Signup: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  inviteToken,
  next,
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
      <div className="rounded p-6 border">
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
    },
  };
};

export default Signup;
