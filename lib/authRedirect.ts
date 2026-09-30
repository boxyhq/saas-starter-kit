import type { ParsedUrlQuery } from 'querystring';

// Normalize legacy invitation/NextAuth links before the Ory hook creates a flow.
export function authRedirect(
  query: ParsedUrlQuery,
  path: string,
  appUrl: string
) {
  if (query.flow || query.return_to) return null;
  let returnTo: URL;
  if (typeof query.token === 'string' && query.token) {
    returnTo = new URL(
      `/invitations/${encodeURIComponent(query.token)}`,
      appUrl
    );
  } else if (typeof query.callbackUrl === 'string') {
    try {
      returnTo = new URL(query.callbackUrl, appUrl);
      if (returnTo.origin !== new URL(appUrl).origin) return null;
    } catch {
      return null;
    }
  } else {
    return null;
  }
  return {
    destination: `${path}?${new URLSearchParams({ return_to: returnTo.href })}`,
    permanent: false as const,
  };
}
