import jackson, {
  IAPIController,
  IOAuthController,
  JacksonOption,
  SAMLConfig,
} from "@boxyhq/saml-jackson";

import env from "./env";

const opts: JacksonOption = {
  externalUrl: env.appUrl,
  samlPath: env.samlPath,
  samlAudience: env.samlAudience,
  db: {
    engine: "sql",
    type: "postgres",
    url: env.databaseUrl,
  },
};

let apiController: IAPIController;
let oauthController: IOAuthController;

const g = global as any;

export default async function init() {
  if (!g.apiController || !g.oauthController) {
    const ret = await jackson(opts);

    apiController = ret.apiController;
    oauthController = ret.oauthController;

    g.apiController = apiController;
    g.oauthController = oauthController;
  } else {
    apiController = g.apiController;
    oauthController = g.oauthController;
  }

  return {
    apiController,
    oauthController,
  };
}

export type { SAMLConfig };
