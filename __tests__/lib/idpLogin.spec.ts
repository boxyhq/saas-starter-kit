jest.mock('lib/jacksonToken', () => ({ redeemJacksonCode: jest.fn() }));
const userInfo = jest.fn();
jest.mock('lib/jackson', () => ({
  __esModule: true,
  default: async () => ({ oauthController: { userInfo } }),
}));
jest.mock('lib/env', () => ({
  __esModule: true,
  default: {
    appUrl: 'https://app.example.com',
    jackson: { productId: 'boxyhq' },
    teamFeatures: { sso: true },
  },
}));
jest.mock('components/shared', () => ({ Loading: () => null }));
jest.mock('next-i18next/serverSideTranslations', () => ({
  serverSideTranslations: async () => ({}),
}));
import type { GetServerSidePropsContext } from 'next';
import { redeemJacksonCode } from 'lib/jacksonToken';
import { getServerSideProps } from 'pages/auth/idp-login';

const setHeader = jest.fn();
const context = {
  query: { code: 'unsolicited-code' },
  res: { setHeader },
} as unknown as GetServerSidePropsContext;
beforeEach(() => {
  jest.resetAllMocks();
  (redeemJacksonCode as jest.Mock).mockResolvedValue({
    access_token: 'access',
  });
});

it('redeems an unsolicited code and selects the validated IdP for a new Ory flow', async () => {
  userInfo.mockResolvedValue({
    requested: { isIdPFlow: true, tenant: 'team-a', product: 'boxyhq' },
  });
  expect(await getServerSideProps(context)).toEqual({ props: {} });
  expect(redeemJacksonCode).toHaveBeenCalledWith(
    expect.objectContaining({
      code: 'unsolicited-code',
      redirect_uri: 'https://app.example.com/auth/idp-login',
    })
  );
  expect(userInfo).toHaveBeenCalledWith('access');
  expect(setHeader).toHaveBeenCalledWith(
    'Set-Cookie',
    expect.stringContaining('sso_tenant=team-a;')
  );
});

it.each([
  { tenant: 'team-a', product: 'boxyhq' },
  { isIdPFlow: true, tenant: 'team-a', product: 'other' },
])('rejects an inappropriate exchange: %p', async (requested) => {
  userInfo.mockResolvedValue({ requested });
  expect(await getServerSideProps(context)).toEqual({ notFound: true });
  expect(setHeader).not.toHaveBeenCalledWith('Set-Cookie', expect.anything());
});

it('does not select an IdP when code redemption fails', async () => {
  (redeemJacksonCode as jest.Mock).mockRejectedValue(
    new Error('Code already used')
  );
  expect(await getServerSideProps(context)).toEqual({ notFound: true });
  expect(userInfo).not.toHaveBeenCalled();
});
