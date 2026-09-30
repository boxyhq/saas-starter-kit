// Avoid loading the real @boxyhq/saml-jackson (embedded Polis) in unit tests.
jest.mock('lib/jackson', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('lib/env', () => ({
  __esModule: true,
  default: { teamFeatures: { sso: true }, jackson: { productId: 'boxyhq' } },
}));

import { injectTenant } from 'pages/api/oauth/authorize';
import authorizeHandler from 'pages/api/oauth/authorize';
import type { NextApiRequest, NextApiResponse } from 'next';
import jackson from 'lib/jackson';

const mockJackson = jackson as unknown as jest.Mock;

const makeResponse = () => {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
    redirect: jest.fn(),
    send: jest.fn(),
  } as unknown as NextApiResponse;
  (response.status as jest.Mock).mockReturnValue(response);
  return response;
};

describe('SSO authorize - injectTenant', () => {
  const base = {
    response_type: 'code',
    client_id: 'dummy',
    redirect_uri:
      'http://localhost:4433/self-service/methods/oidc/callback/sso',
    state: 'abc',
    scope: 'openid email profile',
    nonce: 'n-123',
  };

  it('routes the tenant without changing the OIDC audience', () => {
    const out = injectTenant(base, 'team-42', 'boxyhq');
    expect(out.client_id).toBe('dummy');
    expect(out.tenant).toBe('team-42');
    expect(out.product).toBe('boxyhq');
  });

  it('preserves all other Kratos-supplied params (redirect_uri, state, scope, nonce)', () => {
    const out = injectTenant(base, 'team-42', 'boxyhq');
    expect(out.redirect_uri).toBe(base.redirect_uri);
    expect(out.state).toBe(base.state);
    expect(out.scope).toBe(base.scope);
    expect(out.nonce).toBe(base.nonce);
    expect(out.response_type).toBe('code');
  });

  it('passes params through untouched when no tenant cookie is present', () => {
    const out = injectTenant(base, undefined, 'boxyhq');
    expect(out).toEqual(base);
    expect(out.client_id).toBe('dummy');
  });
});

describe('SSO authorize handler', () => {
  beforeEach(() => mockJackson.mockReset());

  it('redirects to SSO selection without tenant context', async () => {
    const res = makeResponse();
    mockJackson.mockResolvedValueOnce({ oauthController: {} });

    await authorizeHandler(
      {
        method: 'GET',
        query: { client_id: 'dummy' },
        cookies: {},
      } as unknown as NextApiRequest,
      res
    );

    expect(res.redirect).toHaveBeenCalledWith(302, '/auth/sso');
    expect(mockJackson).toHaveBeenCalled();
  });

  it('injects the tenant cookie before redirecting to Polis', async () => {
    const res = makeResponse();
    const authorize = jest.fn().mockResolvedValue({
      redirect_url: 'http://kratos/callback?code=abc',
    });
    mockJackson.mockResolvedValueOnce({ oauthController: { authorize } });

    await authorizeHandler(
      {
        method: 'GET',
        query: { client_id: 'dummy', state: 'state-1' },
        cookies: { sso_tenant: 'team%2F42' },
      } as unknown as NextApiRequest,
      res
    );

    expect(authorize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'dummy',
        tenant: 'team/42',
        product: 'boxyhq',
        state: 'state-1',
      })
    );
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      'http://kratos/callback?code=abc'
    );
  });

  it('renders an authorization form when Polis does not redirect', async () => {
    const res = makeResponse();
    const authorize = jest.fn().mockResolvedValue({
      authorize_form: '<form></form>',
    });
    mockJackson.mockResolvedValueOnce({ oauthController: { authorize } });

    await authorizeHandler(
      {
        method: 'POST',
        body: { client_id: 'tenant=team-1&product=boxyhq' },
        cookies: {},
      } as unknown as NextApiRequest,
      res
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/html; charset=utf-8'
    );
    expect(res.send).toHaveBeenCalledWith('<form></form>');
  });
});
