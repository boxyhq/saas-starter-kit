import type { NextApiRequest, NextApiResponse } from 'next';

const toSession = jest.fn();
const getOrCreateLocalUser = jest.fn();
const teamMemberFindMany = jest.fn();
const getSSOGrant = jest.fn().mockResolvedValue(null);
const applySSOGrant = jest.fn();
jest.mock('lib/ssoGrant', () => ({
  getSSOGrant: (...a: unknown[]) => getSSOGrant(...a),
  applySSOGrant: (...a: unknown[]) => applySSOGrant(...a),
}));

jest.mock('lib/ory', () => ({
  ory: { toSession: (...a: unknown[]) => toSession(...a) },
}));
jest.mock('lib/provisionUser', () => ({
  getOrCreateLocalUser: (...a: unknown[]) => getOrCreateLocalUser(...a),
}));
jest.mock('lib/prisma', () => ({
  prisma: {
    teamMember: { findMany: (...a: unknown[]) => teamMemberFindMany(...a) },
  },
}));

import { getSession } from 'lib/session';

const makeReq = (cookie?: string) =>
  ({ headers: cookie ? { cookie } : {} }) as NextApiRequest;
const res = {} as NextApiResponse;

beforeEach(() => jest.clearAllMocks());

describe('Lib - getSession (Ory-backed)', () => {
  it('returns null when there is no cookie', async () => {
    expect(await getSession(makeReq(), res)).toBeNull();
    expect(toSession).not.toHaveBeenCalled();
  });

  it('returns null when Ory has no valid session', async () => {
    toSession.mockRejectedValueOnce(new Error('401'));
    expect(await getSession(makeReq('ory_session=x'), res)).toBeNull();
  });

  it('returns null for an inactive session', async () => {
    toSession.mockResolvedValueOnce({ active: false, identity: { id: 'o1' } });
    expect(await getSession(makeReq('ory_session=x'), res)).toBeNull();
  });

  it('maps an active Ory session to the local user + roles', async () => {
    toSession.mockResolvedValueOnce({
      active: true,
      expires_at: '2030-01-01T00:00:00Z',
      identity: { id: 'ory-9', traits: { email: 'z@corp.com', name: 'Zed' } },
    });
    getOrCreateLocalUser.mockResolvedValueOnce({
      id: 'local-9',
      email: 'z@corp.com',
      name: 'Zed',
      image: null,
    });
    teamMemberFindMany.mockResolvedValueOnce([{ teamId: 't1', role: 'OWNER' }]);

    const session = await getSession(
      makeReq('ory_session=x; sso_tenant=forged-team'),
      res
    );
    expect(applySSOGrant).not.toHaveBeenCalled();

    expect(getOrCreateLocalUser).toHaveBeenCalledWith(
      { id: 'ory-9', traits: { email: 'z@corp.com', name: 'Zed' } },
      { skipDefaultTeam: false }
    );
    expect(session).toEqual({
      user: {
        id: 'local-9',
        email: 'z@corp.com',
        name: 'Zed',
        image: null,
        roles: [{ teamId: 't1', role: 'OWNER' }],
      },
      expires: '2030-01-01T00:00:00Z',
    });
  });
});
