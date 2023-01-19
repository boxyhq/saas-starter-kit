import { Card, Error, LetterAvatar, Loading } from '@/components/ui';
import { getAxiosError } from '@/lib/common';
import { Team } from '@prisma/client';
import axios from 'axios';
import useTeams from 'hooks/useTeams';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { ApiResponse } from 'types';

const Teams = () => {
  const { isLoading, isError, teams, mutateTeams } = useTeams();
  const { t } = useTranslation('common');
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const leaveTeam = async (team: Team) => {
    try {
      await axios.put<ApiResponse>(`/api/teams/${team.slug}/members`);
      toast.success(t('leave-team-success'));
      mutateTeams();
    } catch (error: any) {
      toast.error(getAxiosError(error));
    }
  };

  return (
    <Card heading="Your Teams">
      <Card.Body>
        <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t('name')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('members')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('created-at')}
              </th>
              <th scope="col" className="px-6 py-3">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {teams &&
              teams.map((team) => {
                return (
                  <tr
                    key={team.id}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-3">
                      <Link href={`/teams/${team.slug}/members`}>
                        <a>
                          <div className="flex items-center justify-start space-x-2">
                            <LetterAvatar name={team.name} />
                            <span className="underline">{team.name}</span>
                          </div>
                        </a>
                      </Link>
                    </td>
                    <td className="px-6 py-3">{team._count.members}</td>
                    <td className="px-6 py-3">
                      {new Date(team.createdAt).toDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          leaveTeam(team);
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
      </Card.Body>
    </Card>
  );
};

export default Teams;
