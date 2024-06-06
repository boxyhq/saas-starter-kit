import jackson, {
  IConnectionAPIController,
  IDirectorySyncController,
  IOAuthController,
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
  openid: {},
} as JacksonOption;

let apiController: IConnectionAPIController;
let oauthController: IOAuthController;
let directorySync: IDirectorySyncController;
let spConfig: ISPSSOConfig;

const g = global as any;

export default async function init() {
  if (
    !g.apiController ||
    !g.oauthController ||
    !g.directorySync ||
    !g.spConfig
  ) {
    const ret = await jackson(opts);

    apiController = ret.apiController;
    oauthController = ret.oauthController;
    directorySync = ret.directorySyncController;
    spConfig = ret.spConfig;

    g.apiController = apiController;
    g.oauthController = oauthController;
    g.directorySync = directorySync;
    g.spConfig = spConfig;
  } else {
    apiController = g.apiController;
    oauthController = g.oauthController;
    directorySync = g.directorySync;
    spConfig = g.spConfig;
  }

  return {
    apiController,
    oauthController,
    directorySync,
    spConfig,
  };
}
