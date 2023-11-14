import { z } from 'zod';
import {
  Directory,
  DirectoryType,
  DirectorySyncEvent,
} from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiResponse } from 'types';
import { ApiError } from '@/lib/errors';
import { options } from './config';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { addTeamMember, removeTeamMember } from 'models/team';
import { deleteUser, getUser } from 'models/user';

export const createDirectorySchema = z.object({
  name: z.string(),
  provider: z.string(),
});

export const deleteDirectorySchema = z.object({
  dsyncId: z.string(),
});

// Fetch DSync connections for a team
export const getDirectoryConnections = async ({
  tenant,
}: {
  tenant: string;
}) => {
  if (env.jackson.selfHosted) {
    const query = new URLSearchParams({
      tenant,
      product: env.jackson.productId,
    });

    const response = await fetch(
      `${env.jackson.url}/api/v1/dsync?${query.toString()}`,
      {
        ...options,
        method: 'GET',
      }
    );

    const json = (await response.json()) as ApiResponse<Directory[]>;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json.data;
  }

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    tenant,
    env.jackson.productId
  );

  if (error) {
    throw new ApiError(error.code, error.message);
  }

  return data;
};

// Create DSync connections for a team
export const createDirectoryConnection = async ({
  name,
  tenant,
  provider,
}: z.infer<typeof createDirectorySchema> & { tenant: string }) => {
  const body = {
    name,
    tenant,
    type: provider as DirectoryType,
    product: env.jackson.productId,
  };

  if (env.jackson.selfHosted) {
    const response = await fetch(`${env.jackson.url}/api/v1/dsync`, {
      ...options,
      method: 'POST',
      body: JSON.stringify({
        ...body,
        webhook_url: env.jackson.dsync.webhook_url,
        webhook_secret: env.jackson.dsync.webhook_secret,
      }),
    });

    const json = (await response.json()) as ApiResponse<Directory>;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json.data;
  }

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.create(body);

  if (error) {
    throw new ApiError(error.code, error.message);
  }

  return data;
};

// Delete DSync connection for a team
export const deleteDirectoryConnection = async ({
  dsyncId,
}: z.infer<typeof deleteDirectorySchema>) => {
  if (env.jackson.selfHosted) {
    const response = await fetch(`${env.jackson.url}/api/v1/dsync/${dsyncId}`, {
      ...options,
      method: 'DELETE',
    });

    const json = (await response.json()) as ApiResponse<Directory[]>;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json.data;
  }

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.delete(dsyncId);

  if (error) {
    throw new ApiError(error.code, error.message);
  }

  return data;
};

// Handle SCIM events
export const handleSCIMEvents = async (event: DirectorySyncEvent) => {
  const { event: action, tenant: teamId, data } = event;

  // Currently we only handle the user events
  // TODO: Handle group events
  if (!('email' in data)) {
    return;
  }

  const { email, first_name, last_name, active } = data;
  const name = `${first_name} ${last_name}`;

  // User has been added
  if (action === 'user.created') {
    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        name,
      },
      create: {
        email,
        name,
      },
    });

    await addTeamMember(teamId, user.id, Role.MEMBER);
  }

  // User has been updated
  else if (action === 'user.updated') {
    const user = await getUser({ email });

    if (!user) {
      return;
    }

    // Deactivation of user by removing them from the team
    if (active === false) {
      await removeTeamMember(teamId, user.id);

      const otherTeamsCount = await prisma.teamMember.count({
        where: {
          userId: user.id,
        },
      });

      if (otherTeamsCount === 0) {
        await deleteUser({ email: user.email });
      }

      return;
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
      },
    });

    // Reactivation of user by adding them back to the team
    await addTeamMember(teamId, user.id, Role.MEMBER);
  }

  // User has been removed
  else if (action === 'user.deleted') {
    const user = await getUser({ email });

    if (!user) {
      return;
    }

    await removeTeamMember(teamId, user.id);

    const otherTeamsCount = await prisma.teamMember.count({
      where: {
        userId: user.id,
      },
    });

    if (otherTeamsCount === 0) {
      await deleteUser({ email: user.email });
    }
  }
};
