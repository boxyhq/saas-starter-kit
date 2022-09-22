import { prisma } from "@/lib/prisma";
import { Team } from "@prisma/client";

export const createTeam = async (param: {
  userId: string;
  name: string;
  slug: string;
}) => {
  const { userId, name, slug } = param;

  const team = await prisma.team.create({
    data: {
      name,
      slug,
    },
  });

  await addTeamMember(team.id, userId, "owner");

  return team;
};

export const getTeam = async (key: { id: string } | { slug: string }) => {
  return await prisma.team.findUniqueOrThrow({
    where: key,
  });
};

export const deleteTeam = async (key: { id: string } | { slug: string }) => {
  return await prisma.team.delete({
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

export const removeTeamMember = async (teamId: string, userId: string) => {
  return await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
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
    include: {
      _count: {
        select: { members: true },
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

export async function isTeamOwner(userId: string, teamId: string) {
  return (await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
      role: "owner",
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

export const updateTeam = async (slug: string, data: Partial<Team>) => {
  return await prisma.team.update({
    where: {
      slug,
    },
    data: data,
  });
};

export const isTeamExists = async (condition: any) => {
  return await prisma.team.count({
    where: {
      OR: condition,
    },
  });
};
