import { Card } from '@/components/shared';
import { WithLoadingAndError } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
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
  const [removeVisible, setRemoveVisible] = React.useState(false);
  const [endpoint, setEndpoint] = React.useState<EndpointOut | null>(null);
  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(
    team.slug
  );

  const deleteWebhook = async (webhook: EndpointOut) => {
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
        <Card heading="Webhooks">
          <Card.Body>
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
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
                    t{'action'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {webhooks?.map((webhook) => {
                  return (
                    <tr
                      key={webhook.id}
                      className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 py-3">{webhook.description}</td>
                      <td className="px-6 py-3">{webhook.url}</td>
                      <td className="px-6 py-3">
                        {webhook.createdAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
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
                              setRemoveVisible(true);
                            }}
                          >
                            {t('remove')}
                          </Button>
                          <ConfirmationDialog
                            visible={removeVisible}
                            onCancel={() => setRemoveVisible(false)}
                            onConfirm={() => deleteWebhook(webhook)}
                            title={t('confirm-delete-webhook')}
                          >
                            {t('delete-webhook-warning')}
                          </ConfirmationDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card.Body>
        </Card>
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
