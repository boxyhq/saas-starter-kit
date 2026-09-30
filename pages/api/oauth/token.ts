import jackson from '@/lib/jackson';
import { redeemJacksonCode } from '@/lib/jacksonToken';
import { recordSSOGrant } from '@/lib/ssoGrant';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const token = await redeemJacksonCode(req.body, req.headers.authorization);
  if (token.id_token) {
    const profile = await oauthController.userInfo(token.access_token);
    await recordSSOGrant(profile);
  }

  res.json(token);
};
