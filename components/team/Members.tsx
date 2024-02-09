import { Error, LetterAvatar, Loading } from '@/components/shared';
import { Team, TeamMember } from '@prisma/client';
import useCanAccess from 'hooks/useCanAccess';
import useTeamMembers, { TeamMemberWithUser } from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';

import { InviteMember } from '@/components/invitation';
import UpdateMemberRole from './UpdateMemberRole';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberWithUser | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(
    team.slug
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!members) {
    return null;
  }

  const removeTeamMember = async (member: TeamMember | null) => {
    if (!member) return;

    const sp = new URLSearchParams({ memberId: member.userId });

    const response = await fetch(
      `/api/teams/${team.slug}/members?${sp.toString()}`,
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

    mutateTeamMembers();
    toast.success(t('member-deleted'));
  };

  const canUpdateRole = (member: TeamMember) => {
    return (
      session?.user.id != member.userId && canAccess('team_member', ['update'])
    );
  };

  const canRemoveMember = (member: TeamMember) => {
    return (
      session?.user.id != member.userId && canAccess('team_member', ['delete'])
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('members')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('members-description')}
          </p>
        </div>
        <Button color="primary" size="md" onClick={() => setVisible(!visible)}>
          {t('add-member')}
        </Button>
      </div>
      <div className="rounder border">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr className="hover:bg-gray-50">
              <th scope="col" className="px-6 py-3">
                {t('name')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('email')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('role')}
              </th>
              {canAccess('team_member', ['delete']) && <th>{t('action')}</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              return (
                <tr
                  key={member.id}
                  className="border-b bg-white last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={member.user.name} />
                      <span>{member.user.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {member.user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {canUpdateRole(member) ? (
                      <UpdateMemberRole team={team} member={member} />
                    ) : (
                      <span>{member.role}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {canRemoveMember(member) ? (
                      <Button
                        size="sm"
                        color="error"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setConfirmationDialogVisible(true);
                        }}
                      >
                        {t('remove')}
                      </Button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={() => removeTeamMember(selectedMember)}
        title={t('confirm-delete-member')}
      >
        {t('delete-member-warning', {
          name: selectedMember?.user.name,
          email: selectedMember?.user.email,
        })}
      </ConfirmationDialog>
      <InviteMember visible={visible} setVisible={setVisible} team={team} />
    </div>
  );
};

export default Members;
