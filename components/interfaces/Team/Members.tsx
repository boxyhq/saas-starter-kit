import { useSession } from "next-auth/react";
import { Button } from "react-daisyui";
import axios from "axios";
import toast from "react-hot-toast";

import { Card, Error, LetterAvatar, Loading } from "@/components/ui";
import { Team, TeamMember } from "@prisma/client";
import useTeamMembers from "hooks/useTeamMembers";
import { isTeamOwner } from "@/lib/teams";

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();

  const { isLoading, isError, members, mutateTeamMembers } = useTeamMembers(
    team.slug
  );

  if (isLoading || !members) {
    return <Loading />;
  }

  if (isError || !session) {
    return <Error />;
  }

  const removeTeamMember = async (member: TeamMember) => {
    await axios.delete(`/api/teams/${team.slug}/members`, {
      data: {
        memberId: member.userId,
      },
    });

    toast.success("Deleted the member successfully.");
    mutateTeamMembers();
  };

  return (
    <Card heading="Team Members">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              {isTeamOwner(session.user, members) && members.length > 1 && (
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              return (
                <tr
                  key={member.id}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={member.user.name} />
                      <span>{member.user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{member.user.email}</td>
                  <td className="px-6 py-3">{member.role}</td>
                  <td className="px-6 py-3">
                    {new Date(member.createdAt).toDateString()}
                  </td>
                  {isTeamOwner(session.user, members) && members.length > 1 && (
                    <td className="px-6 py-3">
                      {session.user.id != member.userId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            removeTeamMember(member);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default Members;
