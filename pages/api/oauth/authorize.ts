import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { SSO_TENANT_COOKIE } from '@/lib/sso';
import { NextApiRequest, NextApiResponse } from 'next';

export const injectTenant = (
  params: Record<string, any>,
  tenant: string | undefined,
  product: string
): Record<string, any> => {
  if (!tenant) {
    return params;
  }
  return {
    ...params,
    tenant,
    product,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!env.teamFeatures.sso) {
    res.status(404).json({ error: { message: 'Not Found' } });
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
      case 'POST':
        await handleAuthorize(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    const message = err.message || 'Something went wrong';
    const status = err.status || 500;
    res.status(status).json({ error: { message } });
  }
}

const handleAuthorize = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const requestParams = req.method === 'GET' ? req.query : req.body;

  const tenant = req.cookies[SSO_TENANT_COOKIE]
    ? decodeURIComponent(req.cookies[SSO_TENANT_COOKIE] as string)
    : undefined;

  const clientId = String(requestParams.client_id || '');
  const hasTenantContext = tenant || clientId.includes('tenant=');
  if (!hasTenantContext) {
    res.redirect(302, '/auth/sso');
    return;
  }

  const { redirect_url, authorize_form } = await oauthController.authorize(
    injectTenant(requestParams, tenant, env.jackson.productId) as any
  );

  if (redirect_url) {
    res.redirect(302, redirect_url);
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(authorize_form);
  }
};
