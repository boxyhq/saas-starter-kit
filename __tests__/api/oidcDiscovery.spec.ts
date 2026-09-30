import type { NextApiRequest, NextApiResponse } from 'next';

let mockState: { openidConfig: jest.Mock; jwks: jest.Mock };

jest.mock('lib/jackson', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    oidcDiscoveryController: {
      openidConfig: (...args: unknown[]) => mockState.openidConfig(...args),
      jwks: (...args: unknown[]) => mockState.jwks(...args),
    },
  }),
}));

import discoveryHandler from '../../pages/api/well-known/openid-configuration';
import jwksHandler from '../../pages/api/oauth/jwks';

const makeResponse = () => {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as NextApiResponse;
  (response.status as jest.Mock).mockReturnValue(response);
  return response;
};

beforeEach(() => {
  mockState = { openidConfig: jest.fn(), jwks: jest.fn() };
});

describe('OIDC discovery handlers', () => {
  it('serves the Polis discovery document for GET', async () => {
    const res = makeResponse();
    const config = { issuer: 'http://localhost:4002' };
    mockState.openidConfig.mockReturnValueOnce(config);

    await discoveryHandler({ method: 'GET' } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(config);
  });

  it('serves JWKS for GET', async () => {
    const res = makeResponse();
    const keys = { keys: [{ kid: 'key-1' }] };
    mockState.jwks.mockResolvedValueOnce(keys);

    await jwksHandler({ method: 'GET' } as NextApiRequest, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(keys);
  });

  it('rejects non-GET discovery requests', async () => {
    const res = makeResponse();
    await discoveryHandler({ method: 'POST' } as NextApiRequest, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects non-GET JWKS requests', async () => {
    const res = makeResponse();
    await jwksHandler({ method: 'POST' } as NextApiRequest, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
