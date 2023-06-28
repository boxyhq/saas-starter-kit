import { Card, EmptyState, WithLoadingAndError } from '@/components/shared';
import Badge from '@/components/shared/Badge';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import fetcher from '@/lib/fetcher';
import type { ApiKey, Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import { ApiResponse } from 'types';

interface APIKeysProps {
  team: Team;
}

const APIKeys = ({ team }: APIKeysProps) => {
  const { t } = useTranslation('common');
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  // Fetch API Keys
  const { data, isLoading, error, mutate } = useSWR<{ data: ApiKey[] }>(
    `/api/teams/${team.slug}/api-keys`,
    fetcher
  );

  // Delete API Key
  const deleteApiKey = async (apiKey: ApiKey | null) => {
    if (!apiKey) return;

    const res = await fetch(`/api/teams/${team.slug}/api-keys/${apiKey.id}`, {
      method: 'DELETE',
    });

    const { data, error } = (await res.json()) as ApiResponse<null>;

    setSelectedApiKey(null);
    setConfirmationDialogVisible(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      mutate();
      toast.success(t('api-key-deleted'));
    }
  };

  const apiKeys = data?.data ?? [];

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      {apiKeys.length === 0 ? (
        <EmptyState
          title={t('no-api-key-title')}
          description={t('no-api-key-description')}
        />
      ) : (
        <>
          <Card heading={t('api-keys')}>
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
                          <Badge color="success">{t('active')}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3">
                          <Button
                            size="xs"
                            color="error"
                            variant="outline"
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setConfirmationDialogVisible(true);
                            }}
                          >
                            {t('revoke')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card.Body>
          </Card>
          <ConfirmationDialog
            title={t('revoke-api-key')}
            visible={confirmationDialogVisible}
            onConfirm={() => deleteApiKey(selectedApiKey)}
            onCancel={() => setConfirmationDialogVisible(false)}
            cancelText={t('cancel')}
            confirmText={t('revoke-api-key')}
          >
            {t('revoke-api-key-confirm')}
          </ConfirmationDialog>
        </>
      )}
    </WithLoadingAndError>
  );
};

export default APIKeys;
