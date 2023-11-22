import { AuthLayout } from '@/components/layouts';
import { Alert, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { useFormik } from 'formik';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, type ReactElement, useEffect } from 'react';
import { Button } from 'react-daisyui';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { ApiResponse, NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const VerifyAccount: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [message, setMessage] = useState<{
    text: string | null;
    status: ComponentStatus | null;
  }>({
    text: null,
    status: null,
  });

  const { error } = router.query as { error: string };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }
  }, [router, router.query, error]);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email(),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/resend-email-token', {
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
      toast.success(t('verify-account-link-sent'));
      router.push('/auth/verify-email');
    },
  });

  return (
    <>
      <Head>
        <title>{t('resend-token-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert status={message.status}>{t(message.text)}</Alert>
      )}
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
              {t('resend-link')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

VerifyAccount.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="verify-your-account">{page}</AuthLayout>;
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

export default VerifyAccount;
