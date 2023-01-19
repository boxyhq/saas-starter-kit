import { Error, InputWithLabel, Loading } from '@/components/ui';
import { getAxiosError } from '@/lib/common';
import type { User } from '@prisma/client';
import axios from 'axios';
import { useFormik } from 'formik';
import useInvitation from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

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
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(7),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await axios.post<ApiResponse<User>>('/api/auth/join', {
          ...values,
        });

        formik.resetForm();
        toast.success(t('successfully-joined'));

        return next ? router.push(next) : router.push('/auth/login');
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
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
        label="Name"
        name="name"
        placeholder="Your name"
        value={formik.values.name}
        error={formik.touched.name ? formik.errors.name : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="email"
        label="Email"
        name="email"
        placeholder="jackson@boxyhq.com"
        value={formik.values.email}
        error={formik.touched.email ? formik.errors.email : undefined}
        onChange={formik.handleChange}
      />
      <InputWithLabel
        type="password"
        label="Password"
        name="password"
        placeholder="Password"
        value={formik.values.password}
        error={formik.touched.password ? formik.errors.password : undefined}
        onChange={formik.handleChange}
      />
      <Button
        type="submit"
        color="primary"
        loading={formik.isSubmitting}
        active={formik.dirty}
        fullWidth
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
