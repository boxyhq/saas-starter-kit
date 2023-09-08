import { WithLoadingAndError } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';

import EditWebhook from './EditWebhook';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';

const Webhooks = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = React.useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    React.useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(
    null
  );

  const [endpoint, setEndpoint] = React.useState<EndpointOut | null>(null);
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
      {webhooks?.length === 0 ? (
        <EmptyState title={t('no-webhook-title')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>{t('name')}</th>
                <th>{t('url')}</th>
                <th>{t('created-at')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {webhooks?.map((webhook) => {
                return (
                  <tr key={webhook.id}>
                    <td>{webhook.description}</td>
                    <td>{webhook.url}</td>
                    <td>{webhook.createdAt.toLocaleString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setEndpoint(webhook);
                            setVisible(!visible);
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
          <ConfirmationDialog
            visible={confirmationDialogVisible}
            onCancel={() => setConfirmationDialogVisible(false)}
            onConfirm={() => deleteWebhook(selectedWebhook)}
            title={t('confirm-delete-webhook')}
          >
            {t('delete-webhook-warning')}
          </ConfirmationDialog>
        </div>
      )}
      {endpoint && (
        <EditWebhook
          visible={visible}
          setVisible={setVisible}
          team={team}
          endpoint={endpoint}
        />
      )}
    </WithLoadingAndError>
  );
};

export default Webhooks;
