import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { useFormik } from 'formik';
import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const ForgotPassword: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      toast.success(t('password-reset-link-sent'));
    },
  });

  return (
    <>
      <Head>
        <title>{t('forgot-password-title')}</title>
      </Head>
      <div className="rounded p-6 border">
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
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
              size="md"
            >
              {t('email-password-reset-link')}
            </Button>
          </div>
        </form>
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

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="Reset Password">{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default ForgotPassword;
