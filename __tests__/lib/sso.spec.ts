import { readCookie } from '@/lib/sso';

describe('SSO cookie helpers', () => {
  it('reads and decodes a named cookie', () => {
    expect(
      readCookie('other=value; sso_tenant=team%2F42; last=entry', 'sso_tenant')
    ).toBe('team/42');
  });

  it('preserves equals signs in cookie values', () => {
    expect(readCookie('token=a=b=c', 'token')).toBe('a=b=c');
  });

  it('returns undefined when the header or cookie is absent', () => {
    expect(readCookie(undefined, 'token')).toBeUndefined();
    expect(readCookie('other=value', 'token')).toBeUndefined();
  });
});
