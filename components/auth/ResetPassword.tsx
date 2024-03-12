import { InputWithLabel } from '@/components/shared';
import {
  defaultHeaders,
  maxLengthPolicies,
  passwordPolicies,
} from '@/lib/common';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const ResetPassword = () => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { token } = router.query as { token: string };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string()
        .required()
        .min(passwordPolicies.minLength)
        .max(maxLengthPolicies.password),
      confirmPassword: Yup.string()
        .max(maxLengthPolicies.password)
        .test(
          'passwords-match',
          'Passwords must match',
          (value, context) => value === context.parent.password
        ),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          token,
        }),
      });

      const json = (await response.json()) as ApiResponse;

      setSubmitting(false);

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      toast.success(t('password-updated'));
      router.push('/auth/login');
    },
  });

  return (
    <div className="rounded p-6 border">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-2">
          <InputWithLabel
            type="password"
            label={t('new-password')}
            name="password"
            placeholder={t('new-password')}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : undefined}
            onChange={formik.handleChange}
          />
          <InputWithLabel
            type="password"
            label={t('confirm-password')}
            name="confirmPassword"
            placeholder={t('confirm-password')}
            value={formik.values.confirmPassword}
            error={
              formik.touched.confirmPassword
                ? formik.errors.confirmPassword
                : undefined
            }
            onChange={formik.handleChange}
          />
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            color="primary"
            loading={submitting}
            active={formik.dirty}
            fullWidth
            size="md"
          >
            {t('reset-password')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
