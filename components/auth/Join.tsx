import { useState } from 'react';
import { InputWithLabel } from '@/components/shared';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import type { User } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button, Checkbox } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import Link from 'next/link';

import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';

const Join = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(true);
  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      team: '',
      agreeToTerms: false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(passwordPolicies.minLength),
      team: Yup.string().required().min(3),
      agreeToTerms: process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL
        ? Yup.boolean().oneOf(
            [true],
            'You must agree to the Terms and Conditions.'
          )
        : Yup.boolean(),
    }),
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<
        User & { confirmEmail: boolean }
      >;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();

      if (json.data.confirmEmail) {
        router.push('/auth/verify-email');
      } else {
        toast.success(t('successfully-joined'));
        router.push('/auth/login');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-1">
        <InputWithLabel
          type="text"
          label={t('name')}
          name="name"
          placeholder={t('your-name')}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="text"
          label={t('team')}
          name="team"
          placeholder={t('team-name')}
          value={formik.values.team}
          error={formik.touched.team ? formik.errors.team : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="email"
          label={t('email')}
          name="email"
          placeholder={t('email-placeholder')}
          value={formik.values.email}
          error={formik.touched.email ? formik.errors.email : undefined}
          onChange={formik.handleChange}
        />
        <div className="relative flex">
          <InputWithLabel
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('password')}
            name="password"
            placeholder={t('password')}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : undefined}
            onChange={formik.handleChange}
          />
          <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={handlePasswordVisibility}
          />
        </div>
        {process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL && (
          <div className="form-control flex  flex-row items-center">
            <div className="space-x-2">
              <Checkbox
                type="checkbox"
                className="checkbox checkbox-primary checkbox-xs"
                onChange={(e) => {
                  formik.setFieldValue('agreeToTerms', e.target.checked);
                }}
              />
              <span className="checkbox-toggle"></span>
            </div>
            <label className="label">
              <span className="label-text">
                Agree to{' '}
                <Link
                  href={process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL}
                  className="text-primary"
                  target="_blank"
                >
                  Terms and conditions
                </Link>
              </span>
            </label>
          </div>
        )}
        {formik.errors.agreeToTerms && (
          <label className="label">
            <span
              className={`label-text-alt ${
                formik.errors.agreeToTerms ? 'text-red-500' : ''
              }`}
            >
              {formik.errors.agreeToTerms}
            </span>
          </label>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <Button
          type="submit"
          color="primary"
          loading={formik.isSubmitting}
          active={formik.dirty}
          fullWidth
          size="md"
        >
          {t('create-account')}
        </Button>
        <p className="text-sm">{t('sign-up-message')}</p>
      </div>
    </form>
  );
};

export default Join;
