import { Role } from '@prisma/client';
import { ApiError } from 'next/dist/server/api-utils';

type RoleType = (typeof Role)[keyof typeof Role];

type Permission = {
  resource: string;
  actions: string[] | '*';
};

type RolePermissions = {
  [role in RoleType]: Permission[];
};

export const availableRoles = [
  {
    id: Role.MEMBER,
    name: 'Member',
  },
  {
    id: Role.ADMIN,
    name: 'Admin',
  },
  {
    id: Role.OWNER,
    name: 'Owner',
  },
];

export const permissions: RolePermissions = {
  OWNER: [
    {
      resource: 'team_settings',
      actions: '*',
    },
  ],
  ADMIN: [
    {
      resource: 'team_settings',
      actions: '*',
    },
  ],
  MEMBER: [
    {
      resource: 'team_settings',
      actions: ['read'],
    },
  ],
};

export const hasPermission = (role: Role, resource: string, action: string) => {
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

export const throwIfNoPermission = (
  role: Role,
  resource: string,
  action: string
) => {
  if (hasPermission(role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `Role '${role}' does not have permission to perform '${action}' on '${resource}'.`
  );
};
