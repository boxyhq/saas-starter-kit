// Initiate an Ory browser flow; Ory retains ownership of CSRF, state and cookies.
export async function startKratosSSO(returnTo?: string) {
  const query = new URLSearchParams({ refresh: 'true' });
  if (returnTo) {
    const target = new URL(returnTo, window.location.origin);
    if (target.origin !== window.location.origin)
      throw new Error('Invalid return URL.');
    query.set('return_to', target.href);
  }
  const flowRes = await fetch(`/self-service/login/browser?${query}`, {
    headers: { accept: 'application/json' },
    credentials: 'include',
  });
  if (!flowRes.ok) throw new Error('Unable to start SSO login.');
  const flow = await flowRes.json();
  const csrfToken = flow.ui.nodes.find(
    (node: { attributes: { name: string; value?: string } }) =>
      node.attributes.name === 'csrf_token'
  )?.attributes.value;
  const submitRes = await fetch(flow.ui.action, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      method: 'oidc',
      provider: 'sso',
      csrf_token: csrfToken,
    }),
  });
  const body = await submitRes.json();
  if (!body.redirect_browser_to) throw new Error('Unable to start SSO login.');
  window.location.assign(body.redirect_browser_to);
}
