import { prisma } from "@/lib/prisma";

export const createTeam = async (param: {
  ownerId: string;
  name: string;
  slug: string;
}) => {
  const { ownerId, name, slug } = param;

  const team = await prisma.team.create({
    data: {
      ownerId,
      name,
      slug,
    },
  });

  await addTeamMember(team.id, ownerId, "owner");

  return team;
};

export const getTeam = async (key: { id: string } | { slug: string }) => {
  return await prisma.team.findUniqueOrThrow({
    where: key,
  });
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: string
) => {
  return await prisma.teamMember.create({
    data: {
      userId,
      teamId,
      role,
    },
  });
};

export const getTeams = async (userId: string) => {
  return await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
  });
};

export async function isTeamMember(userId: string, teamId: string) {
  return (await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  }))
    ? true
    : false;
}

export const getTeamMembers = async (slug: string) => {
  return await prisma.teamMember.findMany({
    where: {
      team: {
        slug,
      },
    },
    include: {
      user: true,
    },
  });
};
