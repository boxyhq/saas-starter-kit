import type { Team } from '@prisma/client';
import axios from 'axios';
import type { FormikHelpers } from 'formik';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import type { WebookFormSchema } from 'types';

import ModalForm from './Form';

const CreateWebhook = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { mutateWebhooks } = useWebhooks(team.slug);
  const { t } = useTranslation('common');

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    const { name, url, eventTypes } = values;

    const response = await axios.post<ApiResponse>(
      `/api/teams/${team.slug}/webhooks`,
      {
        name,
        url,
        eventTypes,
      }
    );

    const { data: webhooks, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (webhooks) {
      toast.success(t('webhook-created'));
    }

    mutateWebhooks();
    setVisible(false);
    formikHelpers.resetForm();
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: '',
        url: '',
        eventTypes: [],
      }}
      onSubmit={onSubmit}
    />
  );
};

export default CreateWebhook;
