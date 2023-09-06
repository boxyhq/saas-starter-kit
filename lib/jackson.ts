import jackson, {
  IConnectionAPIController,
  IDirectorySyncController,
  IOAuthController,
  JacksonOption,
  ISPSAMLConfig,
} from '@boxyhq/saml-jackson';

import env from './env';

const opts = {
  externalUrl: env.appUrl,
  samlPath: env.saml.path,
  samlAudience: env.saml.issuer,
  db: {
    engine: 'sql',
    type: 'postgres',
    url: env.databaseUrl,
  },
  idpDiscoveryPath: '/auth/sso/idp-select',
  openid: {},
} as JacksonOption;

let apiController: IConnectionAPIController;
let oauthController: IOAuthController;
let directorySync: IDirectorySyncController;
let spConfig: ISPSAMLConfig;

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
