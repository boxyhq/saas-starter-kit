import jackson, {
  DirectorySync,
  IAPIController,
  IOAuthController,
  JacksonOption,
  SAMLConfig,
} from "@boxyhq/saml-jackson";

import env from "./env";

const opts = {
  externalUrl: env.appUrl,
  samlPath: env.saml.path,
  samlAudience: env.saml.issuer,
  db: {
    engine: "sql",
    type: "postgres",
    url: env.databaseUrl,
  },
  openid: {},
} as JacksonOption;

let apiController: IAPIController;
let oauthController: IOAuthController;
let directorySync: DirectorySync;

const g = global as any;

export default async function init() {
  if (!g.apiController || !g.oauthController) {
    const ret = await jackson(opts);

    apiController = ret.apiController;
    oauthController = ret.oauthController;
    directorySync = ret.directorySync;

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

export type { SAMLConfig };
