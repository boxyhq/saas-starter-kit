/** @jest-environment node */
import { startKratosSSO } from 'lib/startSSO';

const assign = jest.fn();
const fetchMock = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://app.example.com', assign } },
  });
  globalThis.fetch = fetchMock;
});

it('preserves an invitation through the fresh Ory login and submits its CSRF token', async () => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ui: {
        action: '/self-service/login?flow=123',
        nodes: [{ attributes: { name: 'csrf_token', value: 'csrf' } }],
      },
    }),
  });
  fetchMock.mockResolvedValueOnce({
    json: async () => ({
      redirect_browser_to: 'https://idp.example.com/login',
    }),
  });
  await startKratosSSO('https://app.example.com/invitations/token');
  const url = new URL(fetchMock.mock.calls[0][0], 'https://app.example.com');
  expect(url.searchParams.get('refresh')).toBe('true');
  expect(url.searchParams.get('return_to')).toBe(
    'https://app.example.com/invitations/token'
  );
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
    method: 'oidc',
    provider: 'sso',
    csrf_token: 'csrf',
  });
  expect(assign).toHaveBeenCalledWith('https://idp.example.com/login');
});

it('rejects external invitation destinations before starting a flow', async () => {
  await expect(startKratosSSO('//attacker.example')).rejects.toThrow(
    'Invalid return URL'
  );
  expect(fetchMock).not.toHaveBeenCalled();
});
