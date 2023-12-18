import type {
  DelConnectionsQuery,
  GetConnectionsQuery,
} from '@boxyhq/saml-jackson';

import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { ApiError } from '@/lib/errors';
import { type JacksonSSO, strategyChecker, oidcMetadataParse } from './utils';

export class jacksonEmbedded implements JacksonSSO {
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
    const body = {
      ...params,
      product: env.jackson.productId,
    };

    const { apiController } = await jackson();

    const { isSAML, isOIDC } = strategyChecker(body);

    if (!isSAML && !isOIDC) {
      throw new ApiError(400, 'Could not update SSO connection. Bad request.');
    }

    if (isSAML) {
      await apiController.updateSAMLConnection(body);
    } else {
      await apiController.updateOIDCConnection(oidcMetadataParse(body));
    }
  }

  // Delete SSO connection
  async deleteConnection(params: DelConnectionsQuery) {
    const { apiController } = await jackson();

    await apiController.deleteConnections(params);
  }
}
