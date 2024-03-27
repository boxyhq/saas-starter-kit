import { WithLoadingAndError } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';

import { CreateWebhook, EditWebhook } from '@/components/webhook';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';

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
    if (!webhook) {
      return;
    }

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
            <Table
              cols={[t('name'), t('url'), t('created-at'), t('actions')]}
              body={
                webhooks
                  ? webhooks.map((webhook) => {
                      return {
                        id: webhook.id,
                        cells: [
                          {
                            wrap: true,
                            text: webhook.description,
                          },
                          {
                            wrap: true,
                            text: webhook.url,
                          },
                          {
                            wrap: true,
                            text: webhook.createdAt.toLocaleString(),
                          },
                          {
                            buttons: [
                              {
                                text: t('edit'),
                                onClick: () => {
                                  setEndpoint(webhook);
                                  setUpdateWebhookVisible(
                                    !updateWebhookVisible
                                  );
                                },
                              },
                              {
                                color: 'error',
                                text: t('remove'),
                                onClick: () => {
                                  setSelectedWebhook(webhook);
                                  setConfirmationDialogVisible(true);
                                },
                              },
                            ],
                          },
                        ],
                      };
                    })
                  : []
              }
            ></Table>
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
