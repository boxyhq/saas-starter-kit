import { Card, InputWithLabel } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import { User } from '@prisma/client';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import * as Yup from 'yup';

import ProfileImageUpload from './ProfileImageUpload';

const schema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().required(),
  image: Yup.mixed()
    .required('Please select an image')
    .test('fileFormat', 'Only JPG, PNG, and GIF files are allowed', (value) => {
      if (!value) return true;

      const inputValue = value as string;
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

      const base64Parts = inputValue.split(';base64,');
      const mimeType = base64Parts[0].split(':')[1];
      const fileExtension = mimeType.split('/')[1];

      return allowedExtensions.includes(fileExtension.toLowerCase());
    }),
});

const UpdateAccount = ({ user }: { user: User }) => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email,
      image: user.image,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await axios.put<ApiResponse<User>>('/api/users', {
          ...values,
        });

        toast.success(t('successfully-updated'));
      } catch (error) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card heading={t('update-account')}>
        <Card.Body className="p-4">
          <div className="flex flex-col space-y-2">
            <ProfileImageUpload formik={formik} />
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
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              disabled={!formik.dirty || !formik.isValid}
              size='md'
            >
              {t('save-changes')}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UpdateAccount;
