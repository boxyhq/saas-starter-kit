import { z } from 'zod';
import { SAMLSSORecord } from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiError } from '@/lib/errors';
import { options } from './config';

export const createSSOSchema = z.object({
  metadataUrl: z.string(),
  encodedRawMetadata: z.string(),
});

export const updateSSOSchema = z.union([
  z.object({
    metadataUrl: z.string(),
    encodedRawMetadata: z.string(),
    clientID: z.string(),
    clientSecret: z.string(),
  }),
  z.object({
    deactivated: z.boolean(),
    isOIDC: z.boolean(),
    isSAML: z.boolean(),
    clientID: z.string(),
    clientSecret: z.string(),
  }),
]);

export const deleteSSOSchema = z.object({
  clientID: z.string(),
  clientSecret: z.string(),
});

// Fetch SSO connections for a team
export const getSSOConnections = async ({ tenant }: { tenant: string }) => {
  const params = {
    tenant,
    product: env.jackson.productId,
  };

  if (env.jackson.selfHosted) {
    const query = new URLSearchParams(params);

    const response = await fetch(
      `${env.jackson.url}/api/v1/sso?${query.toString()}`,
      {
        ...options,
        method: 'GET',
      }
    );

    const json = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json as SAMLSSORecord[];
  }

  const { apiController } = await jackson();

  return await apiController.getConnections(params);
};

// Create SSO connection for a team
export const createSSOConnection = async (
  params: z.infer<typeof createSSOSchema> & { tenant: string }
) => {
  const body = {
    ...params,
    defaultRedirectUrl: env.jackson.callback,
    redirectUrl: env.jackson.callback,
    product: env.jackson.productId,
  };

  if (env.jackson.selfHosted) {
    const response = await fetch(`${env.jackson.url}/api/v1/sso`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, json.error.message);
    }

    return json as SAMLSSORecord;
  }

  const { apiController } = await jackson();

  return await apiController.createSAMLConnection(body);
};

// Update SSO connection for a team
export const updateSSOConnection = async (
  params: z.infer<typeof updateSSOSchema> & { tenant: string }
) => {
  const body = {
    ...params,
    product: env.jackson.productId,
  };

  if (env.jackson.selfHosted) {
    const response = await fetch(`${env.jackson.url}/api/v1/sso`, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const json = await response.json();
      throw new ApiError(response.status, json.error.message);
    }

    return;
  }

  const { apiController } = await jackson();

  await apiController.updateSAMLConnection(body);
};

// Delete SSO connections for a team
export const deleteSSOConnections = async (
  params: z.infer<typeof deleteSSOSchema>
) => {
  if (env.jackson.selfHosted) {
    const query = new URLSearchParams(params);

    const response = await fetch(
      `${env.jackson.url}/api/v1/sso?${query.toString()}`,
      {
        ...options,
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const json = await response.json();
      throw new ApiError(response.status, json.error.message);
    }

    return;
  }

  const { apiController } = await jackson();

  await apiController.deleteConnections(params);
};
