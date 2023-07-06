import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { findOrCreateApp } from '@/lib/svix';
import { Role, Team, TeamMember } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

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

  await addTeamMember(team.id, userId, Role.OWNER);

  await findOrCreateApp(team.name, team.id);

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
  role: Role
) => {
  return await prisma.teamMember.upsert({
    create: {
      teamId,
      userId,
      role,
    },
    update: {
      role,
    },
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
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

// Check if the user is a member of the team
export async function isTeamMember(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  });

  return (
    teamMember.role === Role.MEMBER ||
    teamMember.role === Role.OWNER ||
    teamMember.role === Role.ADMIN
  );
}

export async function getTeamRoles(userId: string) {
  const teamRoles = await prisma.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      teamId: true,
      role: true,
    },
  });

  return teamRoles;
}

// Check if the user is an owner of the team
export async function isTeamOwner(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  });

  return teamMember.role === Role.OWNER;
}

// Check if the user is an admin or owner of the team
export async function isTeamAdmin(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      teamId,
    },
  });

  return teamMember.role === Role.ADMIN || teamMember.role === Role.OWNER;
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

export async function hasTeamAccess(
  params: { userId: string | undefined } & (
    | { teamId: string }
    | { teamSlug: string }
  )
) {
  const { userId } = params;

  let teamMember: TeamMember | null = null;

  if ('teamId' in params) {
    teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId: params.teamId,
      },
    });
  }

  if ('teamSlug' in params) {
    teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        team: {
          slug: params.teamSlug,
        },
      },
    });
  }

  if (teamMember) {
    return (
      teamMember.role === Role.MEMBER ||
      teamMember.role === Role.OWNER ||
      teamMember.role === Role.ADMIN
    );
  }

  return false;
}

export const throwIfNoTeamAccess = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { slug } = req.query as { slug: string };

  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      team: {
        slug,
      },
      role: {
        in: ['ADMIN', 'MEMBER', 'OWNER'],
      },
    },
  });

  if (!teamMember) {
    throw new ApiError(403, 'You are not allowed to perform this action');
  }
};
