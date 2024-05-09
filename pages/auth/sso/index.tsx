import { AuthLayout } from '@/components/layouts';
import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { useFormik } from 'formik';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';
import Head from 'next/head';
import { maxLengthPolicies } from '@/lib/common';

const SSO: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ jacksonProductId }) => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);

  const formik = useFormik({
    initialValues: {
      slug: '',
      email: '',
    },
    validationSchema: Yup.object().shape(
      useEmail
        ? {
            email: Yup.string()
              .email()
              .required('Email is required')
              .max(maxLengthPolicies.email),
          }
        : {
            slug: Yup.string()
              .required('Team slug is required')
              .max(maxLengthPolicies.slug),
          }
    ),
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/sso/verify', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      const { data, error } = await response.json();

      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.useSlug) {
        formik.resetForm();
        setUseEmail(false);
        toast.error(t('multiple-sso-teams'));
        return;
      }
      await signIn('boxyhq-saml', undefined, {
        tenant: data.teamId,
        product: jacksonProductId,
      });
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
        <title>{t('signin-with-saml-sso')}</title>
      </Head>
      <div className="rounded p-6 border">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            {useEmail ? (
              <InputWithLabel
                type="email"
                label="Email"
                name="email"
                placeholder="user@boxyhq.com"
                value={formik.values.email}
                error={formik.touched.email ? formik.errors.email : undefined}
                onChange={formik.handleChange}
              />
            ) : (
              <InputWithLabel
                type="text"
                label="Team slug"
                name="slug"
                placeholder="boxyhq"
                value={formik.values.slug}
                descriptionText="Contact your administrator to get your team slug"
                error={formik.touched.slug ? formik.errors.slug : undefined}
                onChange={formik.handleChange}
              />
            )}
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
              size="md"
            >
              {t('continue-with-saml-sso')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/login" className="btn btn-outline w-full">
            {t('sign-in-with-password')}
          </Link>
          <Link href="/auth/magic-link" className="btn btn-outline w-full">
            {t('sign-in-with-email')}
          </Link>
        </div>
      </div>
    </>
  );
};

SSO.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="signin-with-saml-sso"
      description="desc-signin-with-saml-sso"
    >
      {page}
    </AuthLayout>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      jacksonProductId: env.jackson.productId,
    },
  };
}

export default SSO;
