import { AuthLayout } from '@/components/layouts';
import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { useFormik } from 'formik';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken }) => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      const response = await signIn('email', {
        email: values.email,
        csrfToken,
        redirect: false,
        callbackUrl: env.redirectIfAuthenticated,
      });

      formik.resetForm();

      if (response?.error) {
        toast.error(t('email-login-error'));
        return;
      }

      if (response?.status === 200 && response?.ok) {
        toast.success(t('email-login-success'));
        return;
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  return (
    <>
      <Head>
        <title>{t('magic-link-title')}</title>
      </Head>
      <div className="rounded p-6 border">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder="jackson@boxyhq.com"
              value={formik.values.email}
              descriptionText="We’ll email you a magic link for a password-free sign in."
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
              size="md"
            >
              {t('send-magic-link')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/login" className="btn-outline btn w-full">
            &nbsp;{t('sign-in-with-password')}
          </Link>
          <Link href="/auth/sso" className="btn-outline btn w-full">
            &nbsp;{t('continue-with-saml-sso')}
          </Link>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600">
        {t('dont-have-an-account')}
        <Link
          href="/auth/join"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          &nbsp;{t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="Welcome back" description="Log in to your account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(context),
    },
  };
};

export default Login;
