import jackson, {
  IConnectionAPIController,
  IDirectorySyncController,
  IOAuthController,
  IOidcDiscoveryController,
  JacksonOption,
  ISPSSOConfig,
  OIDCAuthzResponsePayload,
} from '@boxyhq/saml-jackson';

export type { OIDCAuthzResponsePayload };

import env from './env';

const opts = {
  externalUrl: env.appUrl,
  samlPath: env.jackson.sso.path,
  oidcPath: env.jackson.sso.oidcPath,
  samlAudience: env.jackson.sso.issuer,
  db: {
    engine: 'sql',
    type: 'postgres',
    url: env.databaseUrl,
  },
  idpDiscoveryPath: '/auth/sso/idp-select',
  idpEnabled: true,
  openid: {
    subjectPrefix: true,
    jwsAlg: env.jackson.openid.jwsAlg,
    ...(env.jackson.openid.privateKey && env.jackson.openid.publicKey
      ? {
          jwtSigningKeys: {
            private: env.jackson.openid.privateKey,
            public: env.jackson.openid.publicKey,
          },
        }
      : {}),
  },
} as JacksonOption;

let apiController: IConnectionAPIController;
let oauthController: IOAuthController;
let directorySync: IDirectorySyncController;
let spConfig: ISPSSOConfig;
let oidcDiscoveryController: IOidcDiscoveryController;

const g = global as any;

export default async function init() {
  if (
    !g.apiController ||
    !g.oauthController ||
    !g.directorySync ||
    !g.spConfig ||
    !g.oidcDiscoveryController
  ) {
    const ret = await jackson(opts);

    apiController = ret.apiController;
    oauthController = ret.oauthController;
    directorySync = ret.directorySyncController;
    spConfig = ret.spConfig;
    oidcDiscoveryController = ret.oidcDiscoveryController;

    g.apiController = apiController;
    g.oauthController = oauthController;
    g.directorySync = directorySync;
    g.spConfig = spConfig;
    g.oidcDiscoveryController = oidcDiscoveryController;
  } else {
    apiController = g.apiController;
    oauthController = g.oauthController;
    directorySync = g.directorySync;
    spConfig = g.spConfig;
    oidcDiscoveryController = g.oidcDiscoveryController;
  }

  return {
    apiController,
    oauthController,
    directorySync,
    spConfig,
    oidcDiscoveryController,
  };
}
