import type {
  DelConnectionsQuery,
  GetConnectionsQuery,
} from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import { options } from '../config';
import { ApiError } from '@/lib/errors';
import { type JacksonSSO } from './utils';
import { forceConsume } from '@/lib/server-common';

export class JacksonHosted implements JacksonSSO {
  private ssoUrl = `${env.jackson.url}/api/v1/sso`;

  // Create SSO connection
  async createConnection(params: any) {
    const response = await fetch(`${this.ssoUrl}`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error.message);
    }

    return result;
  }

  // Get SSO connections
  async getConnections(params: GetConnectionsQuery) {
    const query = new URLSearchParams(params as any);

    const response = await fetch(`${this.ssoUrl}?${query}`, {
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.error.message);
    }

    return result;
  }

  // Update SSO connection
  async updateConnection(params: any) {
    const response = await fetch(`${this.ssoUrl}`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new ApiError(response.status, result.error.message);
    } else {
      forceConsume(response);
    }
  }

  // Delete SSO connection
  async deleteConnection(params: DelConnectionsQuery) {
    const query = new URLSearchParams(params);

    const response = await fetch(`${this.ssoUrl}?${query}`, {
      ...options,
      method: 'DELETE',
    });
    if (!response.ok) {
      const result = await response.json();
      throw new ApiError(response.status, result.error.message);
    } else {
      forceConsume(response);
    }
  }
}
