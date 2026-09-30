/** @jest-environment node */
const exchange = jest.fn();
jest.mock('lib/jackson', () => ({
  __esModule: true,
  default: async () => ({ oauthController: { token: exchange } }),
}));
jest.mock('lib/prisma', () => ({
  prisma: { verificationToken: { create: jest.fn(), deleteMany: jest.fn() } },
}));
import { prisma } from 'lib/prisma';
import { redeemJacksonCode } from 'lib/jacksonToken';

const code = `${'ab'.repeat(32)}.${'cd'.repeat(20)}`;
const body = {
  code,
  client_id: 'dummy',
  client_secret: 'dummy',
  redirect_uri: 'http://localhost/callback',
  grant_type: 'authorization_code' as const,
};

beforeEach(() => {
  jest.resetAllMocks();
  const used = new Set<string>();
  (prisma.verificationToken.create as jest.Mock).mockImplementation(
    async ({ data }) => {
      if (used.has(data.token))
        throw Object.assign(new Error('duplicate'), { code: 'P2002' });
      used.add(data.token);
      return data;
    }
  );
  exchange.mockResolvedValue({ access_token: 'access', id_token: 'id' });
});

it('exchanges a code once, including concurrent replay and equivalent hex keys', async () => {
  const results = await Promise.allSettled([
    redeemJacksonCode(body),
    redeemJacksonCode(body),
    redeemJacksonCode({
      ...body,
      code: `${'AB'.repeat(32)}.${'cd'.repeat(20)}`,
    }),
  ]);
  expect(results.map((result) => result.status)).toEqual([
    'fulfilled',
    'rejected',
    'rejected',
  ]);
  expect(exchange).toHaveBeenCalledTimes(1);
  expect(exchange).toHaveBeenCalledWith(body);
});

it('supports the Basic client authentication used by Ory', async () => {
  await redeemJacksonCode(
    {
      code,
      redirect_uri: body.redirect_uri,
      grant_type: body.grant_type,
    } as Parameters<typeof redeemJacksonCode>[0],
    `Basic ${Buffer.from('dummy:dummy').toString('base64')}`
  );
  expect(exchange).toHaveBeenCalledWith(body);
});

it.each([
  '',
  'not-a-code',
  `${code}.extra`,
  `${'ab'.repeat(32)}zz.${'cd'.repeat(20)}`,
])(
  'rejects malformed codes before writing replay records: %s',
  async (invalid) => {
    await expect(redeemJacksonCode({ ...body, code: invalid })).rejects.toThrow(
      'Invalid authorization code'
    );
    expect(prisma.verificationToken.create).not.toHaveBeenCalled();
    expect(exchange).not.toHaveBeenCalled();
  }
);

it('removes the replay reservation when Jackson rejects an invalid code', async () => {
  exchange.mockRejectedValueOnce(new Error('Invalid code'));
  await expect(redeemJacksonCode(body)).rejects.toThrow('Invalid code');
  expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
    where: { token: expect.any(String) },
  });
});
