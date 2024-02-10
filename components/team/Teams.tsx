import { LetterAvatar } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from './CreateTeam';
import {
  tableClass,
  tableWrapperClass,
  tdClass,
  thClass,
  theadClass,
  trClass,
  trHeadClass,
} from '../styles';

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [team, setTeam] = useState<Team | null>(null);
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

  const leaveTeam = async (team: Team) => {
    const response = await fetch(`/api/teams/${team.slug}/members`, {
      method: 'PUT',
      headers: defaultHeaders,
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('leave-team-success'));
    mutateTeams();
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <h2 className="text-xl font-medium leading-none tracking-tight">
              {t('all-teams')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('team-listed')}
            </p>
          </div>
          <Button
            color="primary"
            size="md"
            onClick={() => setCreateTeamVisible(!createTeamVisible)}
          >
            {t('create-team')}
          </Button>
        </div>
        <div className={tableWrapperClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr className={trHeadClass}>
                <th scope="col" className={thClass}>
                  {t('name')}
                </th>
                <th scope="col" className={thClass}>
                  {t('members')}
                </th>
                <th scope="col" className={thClass}>
                  {t('created-at')}
                </th>
                <th scope="col" className={thClass}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {teams &&
                teams.map((team) => {
                  return (
                    <tr key={team.id} className={trClass}>
                      <td className={tdClass}>
                        <Link href={`/teams/${team.slug}/members`}>
                          <div className="flex items-center justify-start space-x-2">
                            <LetterAvatar name={team.name} />
                            <span className="underline">{team.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className={tdClass}>{team._count.members}</td>
                      <td className={tdClass}>
                        {new Date(team.createdAt).toDateString()}
                      </td>
                      <td className={tdClass}>
                        <Button
                          variant="outline"
                          size="xs"
                          color="error"
                          onClick={() => {
                            setTeam(team);
                            setAskConfirmation(true);
                          }}
                        >
                          {t('leave-team')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <ConfirmationDialog
          visible={askConfirmation}
          title={`${t('leave-team')} ${team?.name}`}
          onCancel={() => setAskConfirmation(false)}
          onConfirm={() => {
            if (team) {
              leaveTeam(team);
            }
          }}
          confirmText={t('leave-team')}
        >
          {t('leave-team-confirmation')}
        </ConfirmationDialog>
        <CreateTeam
          visible={createTeamVisible}
          setVisible={setCreateTeamVisible}
        />
      </div>
    </WithLoadingAndError>
  );
};

export default Teams;
