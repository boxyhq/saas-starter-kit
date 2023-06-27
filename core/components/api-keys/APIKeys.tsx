import { Card, EmptyState, WithLoadingAndError } from '@/components/shared';
import Badge from '@/components/shared/Badge';
import fetcher from '@/lib/fetcher';
import type { ApiKey, Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import useSWR from 'swr';

interface APIKeysProps {
  team: Team;
}

const APIKeys = ({ team }: APIKeysProps) => {
  const { t } = useTranslation('common');

  // Fetch API Keys
  const { data, isLoading, error, mutate } = useSWR<{
    data: ApiKey[];
  }>(`/api/teams/${team.slug}/api-keys`, fetcher);

  // Delete API Key
  const deleteApiKey = async (id: string) => {
    await fetch(`/api/teams/${team.slug}/api-keys/${id}`, {
      method: 'DELETE',
    });

    mutate();
  };

  const apiKeys = data?.data ?? [];

  return (
    <>
      <WithLoadingAndError isLoading={isLoading} error={error}>
        {apiKeys.length === 0 ? (
          <EmptyState
            title="You haven't created any API Keys yet"
            description="API Keys allow your app to communicate with BoxyHQ."
          />
        ) : (
          <Card heading="API Keys">
            <Card.Body>
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      {t('name')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('status')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('created')}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => {
                    return (
                      <tr key={apiKey.id} className="border-b bg-white">
                        <td className="px-6 py-3">{apiKey.name}</td>
                        <td className="px-6 py-3">
                          <Badge color="success">Active</Badge>
                        </td>
                        <td className="px-6 py-3">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          <Button
                            size="xs"
                            color="error"
                            variant="outline"
                            onClick={() => deleteApiKey(apiKey.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        )}
      </WithLoadingAndError>
    </>
  );
};

export default APIKeys;
