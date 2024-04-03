import { InputWithLabel } from '@/components/shared';
import type { FormikConfig } from 'formik';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import type { WebookFormSchema } from 'types';
import * as Yup from 'yup';
import Modal from '../shared/Modal';
import { EventTypes } from '@/components/webhook';
import { maxLengthPolicies } from '@/lib/common';

interface FormProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  initialValues: WebookFormSchema;
  onSubmit: FormikConfig<WebookFormSchema>['onSubmit'];
  title: string;
  editMode?: boolean;
}

const Form = ({
  visible,
  setVisible,
  initialValues,
  onSubmit,
  title,
  editMode = false,
}: FormProps) => {
  const formik = useFormik<WebookFormSchema>({
    validationSchema: Yup.object().shape({
      name: Yup.string().required().max(maxLengthPolicies.webhookDescription),
      url: Yup.string().required().url().max(maxLengthPolicies.webhookEndpoint),
      eventTypes: Yup.array().min(1, 'Please choose at least one event type'),
    }),
    initialValues,
    enableReinitialize: true,
    onSubmit,
    validateOnBlur: false,
  });

  const { t } = useTranslation('common');

  const toggleVisible = () => {
    setVisible(!visible);
    formik.resetForm();
  };

  return (
    <Modal open={visible} close={toggleVisible}>
      <form onSubmit={formik.handleSubmit} method="POST">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Description>{t('webhook-create-desc')}</Modal.Description>
        <Modal.Body>
          <div className="flex flex-col space-y-3">
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setVisible(!visible);
            }}
            size="md"
          >
            {t('close')}
          </Button>
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            size="md"
          >
            {editMode ? t('update-webhook') : t('create-webhook')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default Form;
