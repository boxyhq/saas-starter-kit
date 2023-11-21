import { z } from 'zod';
import { Directory, DirectoryType } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiResponse } from 'types';
import { ApiError } from '@/lib/errors';
import { options } from './config';

export const createDirectorySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const deleteDirectorySchema = z.object({
  dsyncId: z.string(),
});

// Fetch DSync connections for a team
export const getDirectoryConnections = async ({
  tenant,
  dsyncId,
}: {
  tenant?: string;
  dsyncId?: string;
}) => {
  if (env.jackson.selfHosted) {
    let query;
    if (tenant) {
      query = `?${new URLSearchParams({
        tenant,
        product: env.jackson.productId,
      }).toString()}`;
    } else {
      query = `/${dsyncId}`;
    }
    const response = await fetch(`${env.jackson.url}/api/v1/dsync${query}`, {
      ...options,
      method: 'GET',
    });

    const json = (await response.json()) as ApiResponse<Directory[]>;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json.data;
  }

  const { directorySync } = await jackson();

  const { data, error } = tenant
    ? await directorySync.directories.getByTenantAndProduct(
        tenant,
        env.jackson.productId
      )
    : await directorySync.directories.get(dsyncId!);

  if (error) {
    throw new ApiError(error.code, error.message);
  }

  return data;
};

// Create DSync connections for a team
export const createDirectoryConnection = async ({
  name,
  tenant,
  type,
}: z.infer<typeof createDirectorySchema> & { tenant: string }) => {
  const body = {
    name,
    tenant,
    type: type as DirectoryType,
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
