import Link from "next/link";
import { Button } from "react-daisyui";

import { Card, Error, LetterAvatar, Loading } from "@/components/ui";
import useTeams from "hooks/useTeams";

const Teams = () => {
  const { isLoading, isError, teams } = useTeams();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

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
                    <td className="px-6 py-3">
                      {new Date(team.createdAt).toDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        size="sm"
                        color="secondary"
                        className="text-white"
                        variant="outline"
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
