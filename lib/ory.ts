import {
  Configuration,
  FrontendApi,
  IdentityApi,
  type Identity,
  type Session,
} from '@ory/client-fetch';

export const orySdkUrl =
  process.env.ORY_SDK_URL ||
  process.env.NEXT_PUBLIC_ORY_SDK_URL ||
  'http://localhost:4433';

const oryAdminUrl = process.env.ORY_ADMIN_URL || 'http://localhost:4434';

const oryApiKey = process.env.ORY_API_KEY;

export const ory = new FrontendApi(
  new Configuration({
    basePath: orySdkUrl,
    credentials: 'include',
  })
);

export const oryIdentity = new IdentityApi(
  new Configuration({
    basePath: oryAdminUrl,
    ...(oryApiKey ? { accessToken: oryApiKey } : {}),
  })
);

export type OryIdentityTraits = {
  email: string;
  name?: string;
};

export const getIdentityTraits = (identity: Identity): OryIdentityTraits => {
  const traits = (identity.traits ?? {}) as Partial<OryIdentityTraits>;

  return {
    email: traits.email ?? '',
    name: traits.name,
  };
};

export type { Identity, Session };

export default ory;
