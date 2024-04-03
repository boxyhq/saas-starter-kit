import { Error, Loading } from '@/components/shared';
import type { Team } from '@prisma/client';
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
import { defaultHeaders } from '@/lib/common';

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
    return <Error message={isError.message} />;
  }

  const onSubmit = async (
    values: WebookFormSchema,
    formikHelpers: FormikHelpers<WebookFormSchema>
  ) => {
    const response = await fetch(
      `/api/teams/${team.slug}/webhooks/${endpoint.id}`,
      {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      }
    );

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('webhook-updated'));
    mutateWebhooks();
    setVisible(false);
    formikHelpers.resetForm();
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
      title={t('edit-webhook-endpoint')}
      editMode={true}
    />
  );
};

export default EditWebhook;
