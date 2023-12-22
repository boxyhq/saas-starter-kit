import type { Directory, DirectoryType } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import { options } from '../config';
import { ApiError } from '@/lib/errors';
import type { JacksonDsync } from './utils';

export class JacksonHosted implements JacksonDsync {
  private dsyncUrl = `${env.jackson.url}/api/v1/dsync`;

  async createConnection({
    name,
    type,
    tenant,
  }: {
    name: string;
    type: string;
    tenant: string;
  }) {
    const response = await fetch(this.dsyncUrl, {
      ...options,
      method: 'POST',
      body: JSON.stringify({
        name,
        tenant,
        type: type as DirectoryType,
        product: env.jackson.productId,
        webhook_url: env.jackson.dsync.webhook_url,
        webhook_secret: env.jackson.dsync.webhook_secret,
      }),
    });

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, error.message);
    }

    return { data } as { data: Directory };
  }

  async getConnections(params: { tenant: string }) {
    const searchParams = new URLSearchParams({
      tenant: params.tenant,
      product: env.jackson.productId,
    });

    const response = await fetch(`${this.dsyncUrl}?${searchParams}`, {
      ...options,
    });

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, error.message);
    }

    return { data } as { data: Directory[] };
  }

  async updateConnection(params: any) {
    const response = await fetch(`${this.dsyncUrl}/${params.directoryId}`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(params),
    });

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, error.message);
    }

    return { data } as { data: Directory };
  }

  async deleteConnection(params: any) {
    const response = await fetch(`${this.dsyncUrl}/${params.directoryId}`, {
      ...options,
      method: 'DELETE',
    });

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, error.message);
    }

    return { data } as { data: null };
  }

  async getConnectionById(directoryId: string) {
    const response = await fetch(`${this.dsyncUrl}/${directoryId}`, {
      ...options,
    });

    const { data, error } = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, error.message);
    }

    return { data } as { data: Directory };
  }
}
