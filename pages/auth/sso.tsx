import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/ui';
import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useFormik } from 'formik';
import { GetServerSidePropsContext } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useEffect } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const SSO: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const router = useRouter();

  // SSO callback has query paramters called code and state.
  const { code, state } = router.query;

  if (status === 'authenticated') {
    router.push('/dashboard');
  }

  // Handle the SAML SSO callback (ACS)
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!code || !state) {
      return;
    }

    signIn('saml-sso', {
      code,
      state,
      redirect: false,
    });
  }, [router.isReady, code, state]);

  const formik = useFormik({
    initialValues: {
      slug: '',
    },
    validationSchema: Yup.object().shape({
      slug: Yup.string().required('Team slug is required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post<
          ApiResponse<{ redirect_url: string }>
        >('/api/auth/sso', {
          ...values,
        });

        const { data } = response.data;

        if (data) {
          window.location.href = data.redirect_url;
        }
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <>
      <div className="rounded-md bg-white p-6 shadow-sm">
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
