import supabase from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { findOrCreateApp } from '@/lib/svix';
import { Role, Team } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from './user';
import { normalizeUser } from './user';
import { validateWithSchema, teamSlugSchema } from '@/lib/zod';

export const createTeam = async (param: {
  userId: string;
  name: string;
  slug: string;
}) => {
  const { userId, name, slug } = param;

  if (!supabase) throw new Error('Supabase not configured');
  const { data: team, error } = await supabase
    .from('Team')
    .insert({ name, slug })
    .select()
    .single();
  if (error) throw error;

  await addTeamMember(team.id, userId, Role.OWNER);

  await findOrCreateApp(team.name, team.id);

  return team;
};

export const getByCustomerId = async (
  billingId: string
): Promise<Team | null> => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('Team')
    .select('*')
    .eq('billingId', billingId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getTeam = async (key: { id: string } | { slug: string }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('Team')
    .select('*')
    .match(key)
    .maybeSingle();
  if (error || !data) throw error || new Error('Team not found');
  return data;
};

export const deleteTeam = async (key: { id: string } | { slug: string }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('Team')
    .delete()
    .match(key)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: Role
) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('TeamMember')
    .upsert({ teamId, userId, role })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('TeamMember')
    .delete()
    .match({ teamId, userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// List teams for a user
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

// Get roles of user in all teams
export async function getTeamRoles(userId: string) {
  return await prisma.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      teamId: true,
      role: true,
    },
  });
}

// Check if the user is an admin or owner of the team
export async function isTeamAdmin(userId: string, teamId: string) {
  const teamMember = await prisma.teamMember.findUniqueOrThrow({
    where: {
      teamId_userId: {
        userId,
        teamId,
      },
    },
  });

  return teamMember.role === Role.ADMIN || teamMember.role === Role.OWNER;
}

// List members of a team
export const getTeamMembers = async (slug: string) => {
  const members = await prisma.teamMember.findMany({
    where: {
      team: {
        slug,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return members?.map((member) => {
    member.user = normalizeUser(member.user);
    return member;
  });
};

// Update team details
export const updateTeam = async (slug: string, data: Partial<Team>) => {
  return await prisma.team.update({
    where: {
      slug,
    },
    data: data,
  });
};

// Check if team slug already exists
export const isTeamExists = async (slug: string) => {
  return await prisma.team.count({
    where: {
      slug,
    },
  });
};

// Check if the current user has access to the team
// Should be used in API routes to check if the user has access to the team
export const throwIfNoTeamAccess = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { slug } = validateWithSchema(teamSlugSchema, req.query);

  const teamMember = await getTeamMember(session.user.id, slug);

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  return {
    ...teamMember,
    user: {
      ...session.user,
    },
  };
};

// Get the current user's team member object
export const getTeamMember = async (userId: string, slug: string) => {
  return await prisma.teamMember.findFirstOrThrow({
    where: {
      userId,
      team: {
        slug,
      },
      role: {
        in: ['ADMIN', 'MEMBER', 'OWNER'],
      },
    },
    include: {
      team: true,
    },
  });
};

// Get current user with team info
export const getCurrentUserWithTeam = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const user = await getCurrentUser(req, res);

  const { slug } = validateWithSchema(teamSlugSchema, req.query);

  const { role, team } = await getTeamMember(user.id, slug);

  return {
    ...user,
    role,
    team,
  };
};
