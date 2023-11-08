import useSWR from 'swr';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ComputerDesktopIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import fetcher from '@/lib/fetcher';
import { Session } from '@prisma/client';
import { WithLoadingAndError } from '@/components/shared';
import ConfirmationDialog from '../shared/ConfirmationDialog';

type NextAuthSession = Session & { isCurrent: boolean };

const ManageSessions = () => {
  const { t } = useTranslation('common');
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [sessionToDelete, setSessionToDelete] =
    useState<NextAuthSession | null>(null);

  const { data, isLoading, error, mutate } = useSWR<{
    data: NextAuthSession[];
  }>(`/api/sessions`, fetcher);

  const sessions = data?.data ?? [];

  const deleteSession = async (id: string) => {
    try {
      if (!sessionToDelete) {
        throw new Error('Please select a session to delete');
      }

      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error.message);
      }

      toast.success(t('session-removed'));

      if (sessionToDelete.isCurrent) {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      mutate();
      setSessionToDelete(null);
      setAskConfirmation(false);
    }
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <div className="space-y-3">
        <div className="space-y-2">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('browser-sessions')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('manage-sessions')}
          </p>
        </div>
        <table className="text-sm table min-w-full border-b dark:border-base-200">
          <thead className="bg-base-200">
            <tr>
              <th className="w-10/12">{t('device')}</th>
              <th className="w-2/12">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              return (
                <tr key={session.id}>
                  <td>
                    <span className="items-center flex">
                      <ComputerDesktopIcon className="w-6 h-6 inline-block mr-1 text-primary" />
                      {session.isCurrent ? t('this-browser') : t('other')}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown dropdown-left">
                      <label
                        tabIndex={0}
                        className="flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <EllipsisHorizontalIcon className="w-6" />
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu shadow bg-base-100 rounded w-30 border"
                      >
                        <li onClick={() => {}}>
                          <button
                            className="text-red-500 py-2"
                            onClick={() => {
                              setSessionToDelete(session);
                              setAskConfirmation(true);
                            }}
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sessionToDelete && (
          <ConfirmationDialog
            visible={askConfirmation}
            title={t('remove-browser-session')}
            onCancel={() => {
              setAskConfirmation(false);
              setSessionToDelete(null);
            }}
            onConfirm={() => deleteSession(sessionToDelete.id)}
            confirmText={t('remove')}
          >
            {sessionToDelete?.isCurrent
              ? t('remove-current-browser-session-warning')
              : t('remove-other-browser-session-warning')}
          </ConfirmationDialog>
        )}
      </div>
    </WithLoadingAndError>
  );
};

export default ManageSessions;
