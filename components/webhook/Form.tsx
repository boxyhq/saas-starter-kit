import { InputWithLabel } from '@/components/shared';
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
  title,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: WebookFormSchema;
  onSubmit: FormikConfig<WebookFormSchema>['onSubmit'];
  title: string;
}) => {
  const formik = useFormik<WebookFormSchema>({
    validationSchema: Yup.object().shape({
      name: Yup.string().required(),
      url: Yup.string().required().url(),
      eventTypes: Yup.array().min(1, 'Please choose at least one event type'),
    }),
    initialValues,
    enableReinitialize: true,
    onSubmit,
  });

  const { t } = useTranslation('common');

  const toggleVisible = () => {
    setVisible(!visible);
    formik.resetForm();
  };

  return (
    <Modal open={visible}>
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="absolute right-2 top-2 rounded-full btn-outline"
        onClick={toggleVisible}
      >
        ✕
      </Button>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header className="font-bold">{title}</Modal.Header>
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
                    error={formik.errors.eventTypes}
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
            size="md"
          >
            {t('create-webhook')}
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
};

export default Form;
