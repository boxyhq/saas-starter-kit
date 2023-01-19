import jackson, {
  IConnectionAPIController,
  IDirectorySyncController,
  IOAuthController,
  JacksonOption,
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
  openid: {},
} as JacksonOption;

let apiController: IConnectionAPIController;
let oauthController: IOAuthController;
let directorySync: IDirectorySyncController;

const g = global as any;

export default async function init() {
  if (!g.apiController || !g.oauthController || !g.directorySync) {
    const ret = await jackson(opts);

    apiController = ret.apiController;
    oauthController = ret.oauthController;
    directorySync = ret.directorySyncController;

    g.apiController = apiController;
    g.oauthController = oauthController;
    g.directorySync = directorySync;
  } else {
    apiController = g.apiController;
    oauthController = g.oauthController;
    directorySync = g.directorySync;
  }

  return {
    apiController,
    oauthController,
    directorySync,
  };
}
