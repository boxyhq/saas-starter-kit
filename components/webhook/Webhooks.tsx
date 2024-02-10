import { WithLoadingAndError } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';

import CreateWebhook from './CreateWebhook';
import EditWebhook from './EditWebhook';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

const Webhooks = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [createWebhookVisible, setCreateWebhookVisible] = useState(false);
  const [updateWebhookVisible, setUpdateWebhookVisible] = useState(false);
  const [endpoint, setEndpoint] = useState<EndpointOut | null>(null);

  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    React.useState(false);

  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(
    null
  );

  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(
    team.slug
  );

  const deleteWebhook = async (webhook: EndpointOut | null) => {
    if (!webhook) return;

    const sp = new URLSearchParams({ webhookId: webhook.id });

    const response = await fetch(
      `/api/teams/${team.slug}/webhooks?${sp.toString()}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    mutateWebhooks();
    toast.success(t('webhook-deleted'));
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('webhooks')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('webhooks-description')}
            </p>
          </div>
          <Button
            color="primary"
            size="md"
            onClick={() => setCreateWebhookVisible(!createWebhookVisible)}
          >
            {t('add-webhook')}
          </Button>
        </div>
        {webhooks?.length === 0 ? (
          <EmptyState title={t('no-webhook-title')} />
        ) : (
          <div className="overflow-x-auto">
            <div className="rounder border">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="hover:bg-gray-50">
                    <th scope="col" className="px-6 py-3">
                      {t('name')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('url')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('created-at')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('action')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks?.map((webhook) => {
                    return (
                      <tr
                        key={webhook.id}
                        className="border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {webhook.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {webhook.url}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {webhook.createdAt.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setEndpoint(webhook);
                                setUpdateWebhookVisible(!updateWebhookVisible);
                              }}
                            >
                              {t('edit')}
                            </Button>
                            <Button
                              size="xs"
                              color="error"
                              variant="outline"
                              onClick={() => {
                                setSelectedWebhook(webhook);
                                setConfirmationDialogVisible(true);
                              }}
                            >
                              {t('remove')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {endpoint && (
          <EditWebhook
            visible={updateWebhookVisible}
            setVisible={setUpdateWebhookVisible}
            team={team}
            endpoint={endpoint}
          />
        )}
      </div>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => deleteWebhook(selectedWebhook)}
        title={t('confirm-delete-webhook')}
      >
        {t('delete-webhook-warning')}
      </ConfirmationDialog>
      <CreateWebhook
        visible={createWebhookVisible}
        setVisible={setCreateWebhookVisible}
        team={team}
      />
    </WithLoadingAndError>
  );
};

export default Webhooks;
