import { ResetPasswordForm } from '@/components/interfaces/Auth/resetPasswordForm';
import { AuthLayout } from '@/components/layouts';
import { getParsedCookie } from '@/lib/cookie';
import env from '@/lib/env';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPageContext,
} from 'next';
import { getCsrfToken, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import type { NextPageWithLayout } from 'types';

const ResetPasswordPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, redirectAfterSignIn }) => {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'authenticated') {
    router.push(redirectAfterSignIn);
  }

  return (
    <div>
      <ResetPasswordForm />
    </div>
  );
};

ResetPasswordPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="Reset Password" description="Enter new password">
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
      csrfToken: await getCsrfToken(context),
      redirectAfterSignIn: cookieParsed.url ?? env.redirectAfterSignIn,
    },
  };
};

export default ResetPasswordPage;
