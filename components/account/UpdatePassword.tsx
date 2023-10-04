import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { Card, InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import {useState } from 'react';

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
      const response = await fetch('/api/password', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
      formik.resetForm();
    },
  });
  const[isactive,wasactive]=useState(true);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <Card.Body>
            <Card.Header>
              <Card.Title>Password</Card.Title>
              <Card.Description>
                You can change your password here.
              </Card.Description>
            </Card.Header>
            <div className="flex flex-col space-y-3">
              <InputWithLabel
                type={isactive?"password":"text"}
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
                type={isactive?"password":"text"}
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
              <div className='flex'>
                 <input className='bg-black font-xs mt-2 focus:ring-0' type="checkbox" onClick={()=>{wasactive(!isactive)}}/><span className='block mt-2 text-sm ml-2'>Show Password</span>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                loading={formik.isSubmitting}
                disabled={!formik.dirty || !formik.isValid}
                size="md"
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
