import { ApiError } from '@/lib/errors';
import { Action, Resource, permissions } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role, TeamMember } from '@prisma/client';
import type { Session } from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';

export const createUser = async (param: {
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
}) => {
  const { name, email, password, emailVerified } = param;

  return await prisma.user.create({
    data: {
      name,
      email,
      password: password ? password : '',
      emailVerified: emailVerified ? emailVerified : null,
    },
  });
};

export const getUser = async (key: { id: string } | { email: string }) => {
  return await prisma.user.findUnique({
    where: key,
  });
};

export const getUserBySession = async (session: Session | null) => {
  if (session === null || session.user === null) {
    return null;
  }

  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await getUser({ id });
};

export const deleteUser = async (key: { id: string } | { email: string }) => {
  return await prisma.user.delete({
    where: key,
  });
};

const isAllowed = (role: Role, resource: Resource, action: Action) => {
  const rolePermissions = permissions[role];

  if (!rolePermissions) {
    return false;
  }

  for (const permission of rolePermissions) {
    if (permission.resource === resource) {
      if (permission.actions === '*' || permission.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
};

export const throwIfNotAllowed = (
  user: Pick<TeamMember, 'role'>,
  resource: Resource,
  action: Action
) => {
  if (isAllowed(user.role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `You are not allowed to perform ${action} on ${resource}`
  );
};

// Get current user from session
export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
};
