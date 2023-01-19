import { Card, Error, LetterAvatar, Loading } from '@/components/ui';
import { Invitation, Team } from '@prisma/client';
import axios from 'axios';
import useInvitations from 'hooks/useInvitations';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { ApiResponse } from 'types';

const PendingInvitations = ({ team }: { team: Team }) => {
  const { isLoading, isError, invitations, mutateInvitation } = useInvitations(
    team.slug
  );

  const { t } = useTranslation('common');

  if (isLoading || !invitations) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const deleteInvitation = async (invitation: Invitation) => {
    const { data: response } = await axios.delete<ApiResponse<unknown>>(
      `/api/teams/${team.slug}/invitations`,
      {
        data: {
          id: invitation.id,
        },
        validateStatus: () => true,
      }
    );

    if (response.error) {
      toast.error(response.error.message);
    }

    if (response.data) {
      mutateInvitation();
      toast.success(t('invitation-deleted'));
    }
  };

  if (!invitations.length) {
    return null;
  }

  return (
    <Card heading="Invitations Sent">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3" colSpan={2}>
                {t('email')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('role')}
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
            {invitations.map((invitation) => {
              return (
                <tr
                  key={invitation.token}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3" colSpan={2}>
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={invitation.email} />
                      <span>{invitation.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{invitation.role}</td>
                  <td className="px-6 py-3">
                    {new Date(invitation.createdAt).toDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      color="secondary"
                      onClick={() => {
                        deleteInvitation(invitation);
                      }}
                    >
                      {t('remove')}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default PendingInvitations;
