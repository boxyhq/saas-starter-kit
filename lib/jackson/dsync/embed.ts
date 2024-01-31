import type { DirectoryType } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiError } from '@/lib/errors';
import type { JacksonDsync } from './utils';

export class JacksonEmbedded implements JacksonDsync {
  async createConnection({
    name,
    type,
    tenant,
  }: {
    name: string;
    type: string;
    tenant: string;
  }) {
    const { directorySync } = await jackson();

    const { data, error } = await directorySync.directories.create({
      name,
      tenant,
      type: type as DirectoryType,
      product: env.jackson.productId,
    });

    if (error) {
      throw new ApiError(error.code, error.message);
    }

    return { data };
  }

  async getConnections({ tenant }: { tenant: string }) {
    const { directorySync } = await jackson();

    const { data, error } =
      await directorySync.directories.getByTenantAndProduct(
        tenant,
        env.jackson.productId
      );

    if (error) {
      throw new ApiError(error.code, error.message);
    }

    return { data };
  }

  async updateConnection(params: any) {
    const { directorySync } = await jackson();

    const { data, error } = await directorySync.directories.update(
      params.directoryId,
      params
    );

    if (error) {
      throw new ApiError(error.code, error.message);
    }

    return { data };
  }

  async deleteConnection(params: any) {
    const { directorySync } = await jackson();

    const { data, error } = await directorySync.directories.delete(
      params.directoryId
    );

    if (error) {
      throw new ApiError(error.code, error.message);
    }

    return { data };
  }

  async getConnectionById(directoryId: string) {
    const { directorySync } = await jackson();

    const { data, error } = await directorySync.directories.get(directoryId);

    if (error) {
      throw new ApiError(error.code, error.message);
    }

    return { data };
  }
}
