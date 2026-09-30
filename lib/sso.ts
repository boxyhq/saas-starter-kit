export const SSO_TENANT_COOKIE = 'sso_tenant';

export const tenantCookie = (teamId: string) =>
  `${SSO_TENANT_COOKIE}=${encodeURIComponent(teamId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300${process.env.APP_URL?.startsWith('https://') ? '; Secure' : ''}`;

export const readCookie = (
  cookieHeader: string | undefined,
  name: string
): string | undefined => {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
};
