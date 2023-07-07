import { Role } from '@prisma/client';

import { ApiError } from './errors';

type RoleType = (typeof Role)[keyof typeof Role];

type Action = 'create' | 'update' | 'read' | 'list' | 'delete';

// TODO: Add more resources
type Resource =
  | 'team_settings'
  | 'team'
  | 'members'
  | 'invites'
  | 'webhooks'
  | 'api_keys';

export type Permission = {
  resource: Resource;
  actions: Action[] | '*';
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

export const hasPermission = (
  role: Role,
  resource: Resource,
  action: Action
) => {
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
  resource: Resource,
  action: Action
) => {
  if (hasPermission(role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `Role '${role}' does not have permission to perform '${action}' on '${resource}'.`
  );
};
