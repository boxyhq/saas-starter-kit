import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/shared';
import env from '@/lib/env';
import { useFormik } from 'formik';
import { GetServerSidePropsContext } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement } from 'react';
import { Button } from 'react-daisyui';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const SSO: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      slug: '',
    },
    validationSchema: Yup.object().shape({
      slug: Yup.string().required('Team slug is required'),
    }),
    onSubmit: async (values) => {
      await signIn('boxyhq-saml', undefined, {
        tenant: '30e104dc-977e-4478-ac30-117a80e3e554',
        product: env.product,
      });
    },
  });

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    router.push('/dashboard');
  }

  return (
    <>
      <div className="rounded p-6 border">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
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
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
            >
              {t('continue-with-saml-sso')}
            </Button>
          </div>
        </form>
        <div className="divider"></div>
        <div className="space-y-3">
          <Link href="/auth/login">
            <a className="btn-outline btn w-full">
              {t('sign-in-with-password')}
            </a>
          </Link>
          <Link href="/auth/magic-link">
            <a className="btn-outline btn w-full">{t('sign-in-with-email')}</a>
          </Link>
        </div>
      </div>
    </>
  );
};

SSO.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="Sign in with SAML SSO"
      description="Your ID is the slug after the hostname."
    >
      {page}
    </AuthLayout>
  );
};

export async function getStaticProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default SSO;
