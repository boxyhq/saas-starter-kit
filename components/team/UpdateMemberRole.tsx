import { availableRoles } from '@/lib/permissions';
import { Team, TeamMember } from '@prisma/client';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';

interface UpdateMemberRoleProps {
  team: Team;
  member: TeamMember;
}

const UpdateMemberRole = ({ team, member }: UpdateMemberRoleProps) => {
  const { t } = useTranslation('common');

  const updateRole = async (member: TeamMember, role: string) => {
    await axios.patch(`/api/teams/${team.slug}/members`, {
      memberId: member.userId,
      role,
    });

    toast.success(t('member-role-updated'));
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

export default UpdateMemberRole;
