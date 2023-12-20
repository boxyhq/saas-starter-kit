import env from '@/lib/env';
import { options } from '../config';
import { ApiError } from '@/lib/errors';
import type { JacksonDsync } from './utils';
import type { ApiResponse } from 'types';
import type { Directory } from '@boxyhq/saml-jackson';

export class JacksonHosted implements JacksonDsync {
  private dsyncUrl = `${env.jackson.url}/api/v1/dsync`;

  async createConnection(params: any) {
    const response = await fetch(this.dsyncUrl, {
      ...options,
      method: 'POST',
      body: JSON.stringify({
        ...params,
        webhook_url: env.jackson.dsync.webhook_url,
        webhook_secret: env.jackson.dsync.webhook_secret,
      }),
    });

    const json = (await response.json()) as ApiResponse<Directory>;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json;
  }

  async getConnections(params: { tenant: string } | { dsyncId: string }) {
    let query;
    if ('tenant' in params) {
      query = `?${new URLSearchParams({
        tenant: params.tenant,
        product: env.jackson.productId,
      }).toString()}`;
    } else {
      query = `/${params.dsyncId}`;
    }
    const response = await fetch(`${this.dsyncUrl}${query}`, {
      ...options,
      method: 'GET',
    });

    const json = (await response.json()) as Awaited<
      ReturnType<JacksonDsync['getConnections']>
    >;

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json;
  }

  async updateConnection(params: any) {}

  async deleteConnection(params: any) {}
}
