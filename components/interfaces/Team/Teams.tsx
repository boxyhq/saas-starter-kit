import Link from "next/link";
import { Button } from "react-daisyui";
import axios from "axios";
import toast from "react-hot-toast";

import { Card, Error, LetterAvatar, Loading } from "@/components/ui";
import useTeams from "hooks/useTeams";
import { Team } from "@prisma/client";
import { ApiResponse } from "types";

const Teams = () => {
  const { isLoading, isError, teams, mutateTeams } = useTeams();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const leaveTeam = async (team: Team) => {
    const response = await axios.put<ApiResponse>(
      `/api/teams/${team.slug}/members`
    );

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("You have left the team successfully.");

    mutateTeams();
  };

  return (
    <Card heading="Your Teams">
      <Card.Body>
        <table className="w-full table-fixed text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Members
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
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
                        Leave Team
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
