import type { NextApiRequest, NextApiResponse } from 'next';

let mockState: {
  getConnections: jest.Mock;
  getTeam: jest.Mock;
  getUser: jest.Mock;
  getTeams: jest.Mock;
};

jest.mock('lib/jackson/sso', () => ({
  ssoManager: () => ({
    getConnections: (...args: unknown[]) => mockState.getConnections(...args),
  }),
}));
jest.mock('models/team', () => ({
  getTeam: (...args: unknown[]) => mockState.getTeam(...args),
  getTeams: (...args: unknown[]) => mockState.getTeams(...args),
}));
jest.mock('models/user', () => ({
  getUser: (...args: unknown[]) => mockState.getUser(...args),
}));

import startHandler from '../../pages/api/auth/sso/start';
import verifyHandler from '../../pages/api/auth/sso/verify';

const makeResponse = () => {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
  } as unknown as NextApiResponse;
  (response.status as jest.Mock).mockReturnValue(response);
  (response.json as jest.Mock).mockReturnValue(response);
  return response;
};

const request = (overrides: Partial<NextApiRequest>): NextApiRequest =>
  ({ method: 'POST', body: {}, ...overrides }) as NextApiRequest;

beforeEach(() => {
  mockState = {
    getConnections: jest.fn(),
    getTeam: jest.fn(),
    getUser: jest.fn(),
    getTeams: jest.fn(),
  };
});

describe('SSO start handler', () => {
  it('rejects unsupported methods', async () => {
    const res = makeResponse();
    await startHandler(request({ method: 'GET' }), res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('requires a team with an SSO connection and sets the tenant cookie', async () => {
    const res = makeResponse();
    mockState.getConnections.mockResolvedValueOnce([{ id: 'connection-1' }]);

    await startHandler(request({ body: { teamId: 'team/42' } }), res);

    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', [
      expect.stringContaining('sso_tenant=team%2F42'),
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { ok: true } });
  });

  it('returns a client error when no connection exists', async () => {
    const res = makeResponse();
    mockState.getConnections.mockResolvedValueOnce([]);

    await startHandler(request({ body: { teamId: 'team-1' } }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'No SSO connections found for this team.' },
    });
  });
});

describe('SSO verification handler', () => {
  it('rejects unsupported methods', async () => {
    const res = makeResponse();
    await verifyHandler(request({ method: 'GET' }), res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('resolves a team by slug when it has an SSO connection', async () => {
    const res = makeResponse();
    mockState.getTeam.mockResolvedValueOnce({ id: 'team-1' });
    mockState.getConnections.mockResolvedValueOnce([{ id: 'connection-1' }]);

    await verifyHandler(
      request({ body: JSON.stringify({ slug: 'acme' }) }),
      res
    );

    expect(res.json).toHaveBeenCalledWith({ data: { teamId: 'team-1' } });
  });

  it('asks for a slug when an email belongs to multiple SSO teams', async () => {
    const res = makeResponse();
    mockState.getUser.mockResolvedValueOnce({ id: 'user-1' });
    mockState.getTeams.mockResolvedValueOnce([
      { id: 'team-1' },
      { id: 'team-2' },
    ]);
    mockState.getConnections
      .mockResolvedValueOnce([{ id: 'connection-1' }])
      .mockResolvedValueOnce([{ id: 'connection-2' }]);

    await verifyHandler(
      request({ body: JSON.stringify({ email: 'user@example.com' }) }),
      res
    );

    expect(res.json).toHaveBeenCalledWith({ data: { useSlug: true } });
  });

  it('returns an error when the email has no SSO team', async () => {
    const res = makeResponse();
    mockState.getUser.mockResolvedValueOnce({ id: 'user-1' });
    mockState.getTeams.mockResolvedValueOnce([
      { id: 'team-1' },
      { id: 'team-2' },
    ]);
    mockState.getConnections
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await verifyHandler(
      request({ body: JSON.stringify({ email: 'user@example.com' }) }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'No SSO connections found for any team.' },
    });
  });
});
