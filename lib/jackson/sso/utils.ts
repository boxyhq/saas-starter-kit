import type {
  DelConnectionsQuery,
  OIDCSSOConnectionWithDiscoveryUrl,
  OIDCSSOConnectionWithMetadata,
  OIDCSSORecord,
  SAMLSSORecord,
  GetConnectionsQuery,
} from '@boxyhq/saml-jackson';

import { ApiError } from '@/lib/errors';

export const strategyChecker = (body): { isSAML: boolean; isOIDC: boolean } => {
  const isSAML =
    'rawMetadata' in body ||
    'encodedRawMetadata' in body ||
    'metadataUrl' in body ||
    'isSAML' in body;

  const isOIDC =
    'oidcDiscoveryUrl' in body || 'oidcMetadata' in body || 'isOIDC' in body;

  return { isSAML, isOIDC };
};

export const oidcMetadataParse = (
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

export interface JacksonSSO {
  createConnection: (params: any) => Promise<SAMLSSORecord | OIDCSSORecord>;
  getConnections: (
    param: GetConnectionsQuery
  ) => Promise<(SAMLSSORecord | OIDCSSORecord)[]>;
  updateConnection: (params: any) => Promise<void>;
  deleteConnection: (params: DelConnectionsQuery) => Promise<void>;
}
