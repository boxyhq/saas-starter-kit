import { Error, Loading } from '@/components/ui';
import type { Team } from '@prisma/client';
import axios from 'axios';
import type { FormikHelpers } from 'formik';
import useWebhook from 'hooks/useWebhook';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';
import type { WebookFormSchema } from 'types';
import type { ApiResponse } from 'types';

import ModalForm from './Form';

const EditWebhook = ({
  visible,
  setVisible,
  team,
  endpoint,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
  endpoint: EndpointOut;
}) => {
  const { isLoading, isError, webhook } = useWebhook(team.slug, endpoint.id);
  const { t } = useTranslation('common');
  const { mutateWebhooks } = useWebhooks(team.slug);

  if (isLoading || !webhook) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    const { name, url, eventTypes } = values;

    const response = await axios.put<ApiResponse>(
      `/api/teams/${team.slug}/webhooks/${endpoint.id}`,
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
    formikHelpers.resetForm();
    setVisible(false);
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: webhook.description as string,
        url: webhook.url,
        eventTypes: webhook.filterTypes as string[],
      }}
      onSubmit={onSubmit}
    />
  );
};

export default EditWebhook;
