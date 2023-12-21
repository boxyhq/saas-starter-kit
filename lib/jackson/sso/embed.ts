import type {
  DelConnectionsQuery,
  GetConnectionsQuery,
} from '@boxyhq/saml-jackson';

import jackson from '@/lib/jackson';
import { ApiError } from '@/lib/errors';
import { type JacksonSSO, strategyChecker, oidcMetadataParse } from './utils';

export class JacksonEmbedded implements JacksonSSO {
  // Create SSO connection
  async createConnection(params: any) {
    const { apiController } = await jackson();

    const { isSAML, isOIDC } = strategyChecker(params);

    if (!isSAML && !isOIDC) {
      throw new ApiError(400, 'Could not create SSO connection. Bad request.');
    }

    if (isSAML) {
      return await apiController.createSAMLConnection(params);
    } else {
      return await apiController.createOIDCConnection(
        oidcMetadataParse(params)
      );
    }
  }

  // Get SSO connections
  async getConnections(params: GetConnectionsQuery) {
    const { apiController } = await jackson();

    return await apiController.getConnections(params);
  }

  // Update SSO connection
  async updateConnection(params: any) {
    const { apiController } = await jackson();

    const { isSAML, isOIDC } = strategyChecker(params);

    if (!isSAML && !isOIDC) {
      throw new ApiError(400, 'Could not update SSO connection. Bad request.');
    }

    if (isSAML) {
      await apiController.updateSAMLConnection(params);
    } else {
      await apiController.updateOIDCConnection(oidcMetadataParse(params));
    }
  }

  // Delete SSO connection
  async deleteConnection(params: DelConnectionsQuery) {
    const { apiController } = await jackson();

    await apiController.deleteConnections(params);
  }
}
