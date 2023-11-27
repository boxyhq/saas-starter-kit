import {
  OIDCSSOConnectionWithDiscoveryUrl,
  OIDCSSOConnectionWithMetadata,
  SAMLSSORecord,
} from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiError } from '@/lib/errors';
import { options } from './config';

const strategyChecker = (body): { isSAML: boolean; isOIDC: boolean } => {
  const isSAML =
    'rawMetadata' in body ||
    'encodedRawMetadata' in body ||
    'metadataUrl' in body ||
    'isSAML' in body;

  const isOIDC =
    'oidcDiscoveryUrl' in body || 'oidcMetadata' in body || 'isOIDC' in body;

  return { isSAML, isOIDC };
};

// The oidcMetadata JSON will be parsed here
const oidcMetadataParse = (
  body: (
    | OIDCSSOConnectionWithDiscoveryUrl
    | (Omit<OIDCSSOConnectionWithMetadata, 'oidcMetadata'> & {
        oidcMetadata: string;
      })
  ) & {
    clientID: string;
    clientSecret: string;
  }
) => {
  if (!body.oidcDiscoveryUrl && typeof body.oidcMetadata === 'string') {
    try {
      const oidcMetadata = JSON.parse(body.oidcMetadata);
      return { ...body, oidcMetadata };
    } catch (err) {
      throw new ApiError(
        400,
        'Could not parse OIDC Provider metadata, expected a valid JSON string'
      );
    }
  }
  return body;
};

// Fetch SSO connections for a team
export const getSSOConnections = async ({
  tenant,
  clientID,
}: {
  tenant?: string;
  clientID?: string;
}) => {
  let params;
  if (tenant) {
    params = { tenant, product: env.jackson.productId };
  } else {
    params = { clientID };
  }
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
export const createSSOConnection = async (params) => {
  const body = {
    ...params,
    defaultRedirectUrl: env.jackson.sso.callback,
    redirectUrl: env.jackson.sso.callback,
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

  const { isSAML, isOIDC } = strategyChecker(body);

  if (!isSAML && !isOIDC) {
    throw { message: 'Missing SSO connection params', statusCode: 400 };
  }

  // Create SAML connection
  if (isSAML) {
    return await apiController.createSAMLConnection(body);
  }

  // Create OIDC connection
  if (isOIDC) {
    return await apiController.createOIDCConnection(oidcMetadataParse(body));
  }
};

// Update SSO connection for a team
export const updateSSOConnection = async (params) => {
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

  const { isSAML, isOIDC } = strategyChecker(body);

  if (!isSAML && !isOIDC) {
    throw { message: 'Missing SSO connection params', statusCode: 400 };
  }

  // Update SAML connection
  if (isSAML) {
    return await apiController.updateSAMLConnection(body);
  }

  // Update OIDC connection
  if (isOIDC) {
    return await apiController.updateOIDCConnection(oidcMetadataParse(body));
  }
};

// Delete SSO connections for a team
export const deleteSSOConnections = async (params) => {
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
