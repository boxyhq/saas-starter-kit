import { ApiError } from '@/lib/errors';
import { Action, Resource, permissions } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import type { Session } from 'next-auth';

export const createUser = async (param: {
  name: string;
  email: string;
  password?: string;
}) => {
  const { name, email, password } = param;

  return await prisma.user.create({
    data: {
      name,
      email,
      password: password ? password : '',
      emailVerified: new Date(),
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

export const isAllowed = (role: Role, resource: Resource, action: Action) => {
  const rolePermissions = permissions['MEMBER'];

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
  role: Role,
  resource: Resource,
  action: Action
) => {
  console.log(
    `isAllowed - perform ${action} on ${resource}`,
    isAllowed(role, resource, action)
  );

  if (isAllowed(role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `Role '${role}' does not have permission to perform '${action}' on '${resource}'.`
  );
};
