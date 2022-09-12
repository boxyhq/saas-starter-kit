import { Card, LetterAvatar } from "@/components/ui";
import { Tenant } from "@prisma/client";
import useTeams from "hooks/useTeams";
import Link from "next/link";
import { Button } from "react-daisyui";

const TeamsList = ({ tenant }: { tenant: Tenant }) => {
  const { isLoading, isError, teams } = useTeams(tenant.slug);

  if (isLoading) {
    return <>Loading...</>;
  }

  if (isError) {
    return <>500 Error.</>;
  }

  console.log(teams);

  return (
    <Card heading="Your Teams">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
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
                      <Link
                        href={`/organizations/${tenant.slug}/teams/${team.name}/members`}
                      >
                        <a>
                          <div className="flex items-center justify-start space-x-2 underline">
                            <LetterAvatar name={team.name} />
                            <span>{team.name}</span>
                          </div>
                        </a>
                      </Link>
                    </td>
                    <td className="px-6 py-3">{team.createdAt}</td>
                    <td className="px-6 py-3">
                      <Button
                        size="sm"
                        color="secondary"
                        className="text-white"
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

export default TeamsList;
