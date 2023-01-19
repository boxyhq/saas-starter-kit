import { useSession } from "next-auth/react";
import { Button } from "react-daisyui";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "next-i18next";
import { Card, Error, LetterAvatar, Loading } from "@/components/ui";
import { Team, TeamMember } from "@prisma/client";
import useTeamMembers from "hooks/useTeamMembers";
import { isTeamAdmin } from "@/lib/teams";
import { availableRoles } from "@/lib/roles";

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

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

    mutateTeamMembers();

    toast.success("Deleted the member successfully.");
  };

  const isAdmin = isTeamAdmin(session.user, members);

  const canUpdateRole = (member: TeamMember) => {
    return session.user.id != member.userId && isAdmin;
  };

  const canRemoveMember = (member: TeamMember) => {
    return session.user.id != member.userId && isAdmin;
  };

  return (
    <Card heading="Team Members">
      <Card.Body>
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                {t("name")}
              </th>
              <th scope="col" className="px-6 py-3">
                {t("email")}
              </th>
              <th scope="col" className="px-6 py-3">
                {t("role")}
              </th>
              {isAdmin && (
                <th scope="col" className="px-6 py-3">
                  {t("action")}
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
                  <td className="px-6 py-3">
                    {canUpdateRole(member) ? (
                      <UpdateRoleDropdown team={team} member={member} />
                    ) : (
                      <span>{member.role}</span>
                    )}
                  </td>
                  {canRemoveMember(member) && (
                    <td className="px-6 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          removeTeamMember(member);
                        }}
                      >
                        {t("remove")}
                      </Button>
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

const UpdateRoleDropdown = ({
  team,
  member,
}: {
  team: Team;
  member: TeamMember;
}) => {
  const updateRole = async (member: TeamMember, role: string) => {
    await axios.patch(`/api/teams/${team.slug}/members`, {
      memberId: member.userId,
      role,
    });

    toast.success("Updated the role successfully.");
  };

  return (
    <select
      className="rounded-md text-sm"
      onChange={(e) => updateRole(member, e.target.value)}
    >
      {availableRoles.map((role) => (
        <option value={role.id} key={role.id} selected={role.id == member.role}>
          {role.id}
        </option>
      ))}
    </select>
  );
};

export default Members;
