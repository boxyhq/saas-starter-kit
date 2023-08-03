import { Card, InputWithLabel } from '@/components/shared';
import { getAxiosError } from '@/lib/common';
import axios from 'axios';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  currentPassword: Yup.string().required(),
  newPassword: Yup.string().required().min(7),
});

const UpdatePassword = () => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        await axios.put(`/api/password`, values);

        toast.success(t('successfully-updated'));
        formik.resetForm();
      } catch (error: any) {
        toast.error(getAxiosError(error));
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card heading={t('update-password')}>
          <Card.Body className="p-4">
            <div className="flex flex-col space-y-3">
              <InputWithLabel
                type="password"
                label={t('current-password')}
                name="currentPassword"
                placeholder={t('current-password')}
                value={formik.values.currentPassword}
                error={
                  formik.touched.currentPassword
                    ? formik.errors.currentPassword
                    : undefined
                }
                onChange={formik.handleChange}
              />
              <InputWithLabel
                type="password"
                label={t('new-password')}
                name="newPassword"
                placeholder={t('new-password')}
                value={formik.values.newPassword}
                error={
                  formik.touched.newPassword
                    ? formik.errors.newPassword
                    : undefined
                }
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
                {t('change-password')}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </>
  );
};

export default UpdatePassword;
