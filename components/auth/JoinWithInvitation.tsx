import {
  Error,
  InputWithLabel,
  Loading,
  WithLoadingAndError,
} from '@/components/shared';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import type { User } from '@prisma/client';
import { useFormik } from 'formik';
import useInvitation from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import { useState } from 'react';
import AgreeMessage from './AgreeMessage';

const JoinWithInvitation = ({ inviteToken }: { inviteToken: string }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { isLoading, isError } = useInvitation(inviteToken);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      password: Yup.string().required().min(passwordPolicies.minLength),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/join', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          inviteToken,
        }),
      });

      const json = (await response.json()) as ApiResponse<User>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      formik.resetForm();
      toast.success(t('successfully-joined'));
      router.push(`/auth/login?token=${inviteToken}`);
    },
  });

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
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
          <AgreeMessage text="create-account" />
        </div>
      </form>
    </WithLoadingAndError>
  );
};

export default JoinWithInvitation;
