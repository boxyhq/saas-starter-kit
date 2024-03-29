import { prisma } from '@/lib/prisma';

export const countTeamMembers = async ({ where }) => {
  return await prisma.teamMember.count({
    where,
  });
};

export const updateTeamMember = async ({ where, data }) => {
  return await prisma.teamMember.update({
    where,
    data,
  });
};
