import { authRedirect } from 'lib/authRedirect';
const origin = 'https://app.example.com';

it.each(['/auth/login', '/auth/join'])(
  'preserves an invitation before %s initializes an Ory flow',
  (page) => {
    const redirect = authRedirect({ token: 'invitation-token' }, page, origin);
    const url = new URL(redirect!.destination, origin);
    expect(url.searchParams.get('return_to')).toBe(
      `${origin}/invitations/invitation-token`
    );
    expect(url.searchParams.has('token')).toBe(false);
  }
);
it('preserves local callback destinations and rejects external ones', () => {
  expect(
    authRedirect(
      { callbackUrl: `${origin}/teams/acme/settings` },
      '/auth/login',
      origin
    )?.destination
  ).toContain('return_to=');
  expect(
    authRedirect(
      { callbackUrl: 'https://attacker.example' },
      '/auth/login',
      origin
    )
  ).toBeNull();
  expect(
    authRedirect({ callbackUrl: '//attacker.example' }, '/auth/login', origin)
  ).toBeNull();
});
it('does not restart an existing Ory flow or override its destination', () => {
  expect(
    authRedirect({ token: 'x', flow: 'flow-id' }, '/auth/join', origin)
  ).toBeNull();
  expect(
    authRedirect({ token: 'x', return_to: '/dashboard' }, '/auth/login', origin)
  ).toBeNull();
});
