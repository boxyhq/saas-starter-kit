import { InputWithLabel } from '@/components/ui';
import type { FormikConfig } from 'formik';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button, Modal } from 'react-daisyui';
import type { WebookFormSchema } from 'types';
import * as Yup from 'yup';

import EventTypes from './EventTypes';

const Form = ({
  visible,
  setVisible,
  initialValues,
  onSubmit,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: WebookFormSchema;
  onSubmit: FormikConfig<WebookFormSchema>['onSubmit'];
}) => {
  const formik = useFormik<WebookFormSchema>({
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      url: Yup.string().required().url(),
      eventTypes: Yup.array(),
    }),
    initialValues,
    enableReinitialize: true,
    onSubmit,
  });

  const { t } = useTranslation('common');

  return (
    <Modal open={visible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">
          {t('edit-webhook-endpoint')}
        </Modal.Header>
        <Modal.Body>
          <div className="mt-2 flex flex-col space-y-4">
            <p>{t('webhook-create-desc')}</p>
            <div className="flex flex-col space-y-2">
              <InputWithLabel
                name="name"
                label="Description"
                onChange={formik.handleChange}
                value={formik.values.name}
                placeholder="Description of what this endpoint is used for."
                error={formik.errors.name}
              />
              <InputWithLabel
                name="url"
                label="Endpoint"
                onChange={formik.handleChange}
                value={formik.values.url}
                placeholder="https://api.example.com/svix-webhooks"
                error={formik.errors.url}
                descriptionText="The endpoint URL must be HTTPS"
              />
              <div className="divider"></div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">{t('events-to-send')}</span>
                </label>
                <p className="ml-1 mb-3 text-sm font-normal text-gray-500">
                  {t('events-description')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <EventTypes
                    onChange={formik.handleChange}
                    values={initialValues['eventTypes']}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Actions>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
          >
            {t('create-webhook')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
              formik.resetForm();
            }}
          >
            {t('close')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default Form;
