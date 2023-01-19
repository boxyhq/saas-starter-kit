import { Card, Error, Loading } from '@/components/ui';
import { Team } from '@prisma/client';
import axios from 'axios';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { EndpointOut } from 'svix';

import EditWebhook from './EditWebhook';

const Webhooks = ({ team }: { team: Team }) => {
  const [visible, setVisible] = React.useState(false);
  const [endpoint, setEndpoint] = React.useState<EndpointOut | null>(null);

  const { t } = useTranslation('common');

  const { isLoading, isError, webhooks, mutateWebhooks } = useWebhooks(
    team.slug
  );

  if (isLoading || !webhooks) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const deleteWebhook = async (webhook: EndpointOut) => {
    const response = await axios.delete(`/api/teams/${team.slug}/webhooks`, {
      data: {
        webhookId: webhook.id,
      },
    });

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    mutateWebhooks();

    toast.success(t('webhook-deleted'));
  };

  return (
    <>
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
              {webhooks.map((webhook) => {
                return (
                  <tr
                    key={webhook.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">{webhook.description}</td>
                    <td className="px-6 py-3">{webhook.url}</td>
                    <td className="px-6 py-3">
                      {webhook.createdAt.toISOString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEndpoint(webhook);
                            setVisible(!visible);
                          }}
                        >
                          {t('edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            deleteWebhook(webhook);
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
        </Card.Body>
      </Card>
      {endpoint && (
        <EditWebhook
          visible={visible}
          setVisible={setVisible}
          team={team}
          endpoint={endpoint}
        />
      )}
    </>
  );
};

export default Webhooks;
