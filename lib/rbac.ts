import { Role } from '@prisma/client';
import { ApiError } from './errors';
import { getTeamMember } from 'models/team';

export async function validateMembershipOperation(
  memberId: string,
  teamMember
) {
  const updatingMember = await getTeamMember(memberId, teamMember.team.slug);
  // Member and Admin can't update the role of Owner
  if (
    (teamMember.role === Role.MEMBER || teamMember.role === Role.ADMIN) &&
    updatingMember.role === Role.OWNER
  ) {
    throw new ApiError(
      403,
      'You do not have permission to update the role of this member.'
    );
  }
  // Member can't update the role of Admin & Owner
  if (
    teamMember.role === Role.MEMBER &&
    (updatingMember.role === Role.ADMIN || updatingMember.role === Role.OWNER)
  ) {
    throw new ApiError(
      403,
      'You do not have permission to update the role of this member.'
    );
  }
}
