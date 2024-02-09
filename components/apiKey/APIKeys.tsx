import { EmptyState, WithLoadingAndError } from '@/components/shared';
import Badge from '@/components/shared/Badge';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import fetcher from '@/lib/fetcher';
import type { ApiKey, Team } from '@prisma/client';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import type { ApiResponse } from 'types';
import NewAPIKey from './NewAPIKey';

interface APIKeysProps {
  team: Team;
}

const APIKeys = ({ team }: APIKeysProps) => {
  const { t } = useTranslation('common');
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
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

    const response = await fetch(
      `/api/teams/${team.slug}/api-keys/${apiKey.id}`,
      {
        method: 'DELETE',
      }
    );

    setSelectedApiKey(null);
    setConfirmationDialogVisible(false);

    if (!response.ok) {
      const { error } = (await response.json()) as ApiResponse;
      toast.error(error.message);
      return;
    }

    mutate();
    toast.success(t('api-key-deleted'));
  };

  const apiKeys = data?.data ?? [];

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('api-keys')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('api-keys-description')}
            </p>
          </div>
          <Button
            color="primary"
            size="md"
            onClick={() => setCreateModalVisible(true)}
          >
            {t('create-api-key')}
          </Button>
        </div>
        {apiKeys.length === 0 ? (
          <EmptyState
            title={t('no-api-key-title')}
            description={t('no-api-key-description')}
          />
        ) : (
          <div className="rounder border">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr className="hover:bg-gray-50">
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
                    <tr
                      key={apiKey.id}
                      className="border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {apiKey.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <Badge color="success">{t('active')}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
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
          </div>
        )}
        <NewAPIKey
          team={team}
          createModalVisible={createModalVisible}
          setCreateModalVisible={setCreateModalVisible}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default APIKeys;
