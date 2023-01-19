import GithubButton from '@/components/interfaces/Auth/GithubButton';
import GoogleButton from '@/components/interfaces/Auth/GoogleButton';
import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/ui';
import { getParsedCookie } from '@/lib/cookie';
import env from '@/lib/env';
import { useFormik } from 'formik';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, redirectAfterSignIn }) => {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');

  if (status === 'authenticated') {
    router.push(redirectAfterSignIn);
  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
      password: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      const response = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectAfterSignIn,
      });

      formik.resetForm();

      if (!response?.ok) {
        toast.error(t('login-error'));
        return;
      }
    },
  });

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
            <InputWithLabel
              type="password"
              label="Password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              error={
                formik.touched.password ? formik.errors.password : undefined
              }
              onChange={formik.handleChange}
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
            >
              {t('sign-in')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/magic-link">
            <a className="btn-outline btn w-full">
              &nbsp;{t('sign-in-with-email')}
            </a>
          </Link>
          <Link href="/auth/sso">
            <a className="btn-outline btn w-full">
              &nbsp;{t('continue-with-saml-sso')}
            </a>
          </Link>
          <div className="divider">or</div>
          <GithubButton />
          <GoogleButton />
        </div>
      </div>
      <p className="text-center text-sm text-gray-600">
        {t('dont-have-an-account')}
        <Link href="/auth/join">
          <a className="font-medium text-indigo-600 hover:text-indigo-500">
            &nbsp;{t('create-a-free-account')}
          </a>
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

export default Login;
