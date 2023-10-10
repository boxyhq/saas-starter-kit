import { Error, InputWithLabel, Loading } from '@/components/shared';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import type { User } from '@prisma/client';
import { useFormik } from 'formik';
import useInvitation from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button, Checkbox } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import Link from 'next/link';

const JoinWithInvitation = ({
  inviteToken,
  next,
}: {
  inviteToken: string;
  next: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { isLoading, isError, invitation } = useInvitation(inviteToken);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: invitation?.email,
      password: '',
      agreeToTerms: false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(passwordPolicies.minLength),
      agreeToTerms: process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL
        ? Yup.boolean().oneOf(
            [true],
            'You must agree to the Terms and Conditions.'
          )
        : Yup.boolean(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<User>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      toast.success(t('successfully-joined'));

      return next ? router.push(next) : router.push('/auth/login');
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <form className="space-y-3" onSubmit={formik.handleSubmit}>
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
        type="email"
        label={t('email')}
        name="email"
        placeholder={t('your-email')}
        value={formik.values.email}
        error={formik.touched.email ? formik.errors.email : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="password"
        label={t('password')}
        name="password"
        placeholder={t('password')}
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : undefined}
        onChange={formik.handleChange}
      />
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
      <div>
        <p className="text-sm">{t('sign-up-message')}</p>
      </div>
    </form>
  );
};

export default JoinWithInvitation;
