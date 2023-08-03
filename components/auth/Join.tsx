import { InputWithLabel } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import type { User } from '@prisma/client';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

const Join = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      team: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(7),
      team: Yup.string().required().min(3),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post<
          ApiResponse<User & { confirmEmail: boolean }>
        >('/api/auth/join', {
          ...values,
        });

        const { confirmEmail } = response.data.data;

        formik.resetForm();

        if (confirmEmail) {
          router.push('/auth/verify-email');
        } else {
          toast.success(t('successfully-joined'));
          router.push('/auth/login');
        }
      } catch (error: any) {
        toast.error(getAxiosError(error));
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
        <InputWithLabel
          type="password"
          label={t('password')}
          name="password"
          placeholder={t('password')}
          value={formik.values.password}
          error={formik.touched.password ? formik.errors.password : undefined}
          onChange={formik.handleChange}
        />
      </div>
      <div className="mt-3 space-y-3">
        <Button
          type="submit"
          color="primary"
          loading={formik.isSubmitting}
          active={formik.dirty}
          fullWidth
          size='md'
        >
          {t('create-account')}
        </Button>
        <p className="text-sm">{t('sign-up-message')}</p>
      </div>
    </form>
  );
};

export default Join;
