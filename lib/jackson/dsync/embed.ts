import type { DirectoryType } from '@boxyhq/saml-jackson';
import type { JacksonDsync } from './utils';
import jackson from '@/lib/jackson';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';

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
    const body = {
      name,
      tenant,
      type: type as DirectoryType,
      product: env.jackson.productId,
    };
    const { directorySync } = await jackson();

    const data = await directorySync.directories.create(body);

    if (data.error) {
      throw new ApiError(data.error.code, data.error.message);
    }

    return data;
  }

  async getConnections(params: { tenant: string } | { dsyncId: string }) {
    const { directorySync } = await jackson();
    let data;
    if ('tenant' in params) {
      data = await directorySync.directories.getByTenantAndProduct(
        params.tenant,
        env.jackson.productId
      );
    } else if ('dsyncId' in params) {
      data = await directorySync.directories.get(params.dsyncId!);
    }

    if (data?.error) {
      throw new ApiError(data.error.code, data.error.message);
    }

    return data;
  }

  async updateConnection(params: any) {
    const { directorySync } = await jackson();

    const data = await directorySync.directories.update(
      params.directoryId,
      params
    );

    if (data?.error) {
      throw new ApiError(data.error.code, data.error.message);
    }

    return data;
  }

  async deleteConnection(params: any) {
    const { directorySync } = await jackson();

    const data = await directorySync.directories.delete(params.directoryId);

    if (data?.error) {
      throw new ApiError(data.error.code, data.error.message);
    }

    return data;
  }
}
