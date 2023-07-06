import jackson from '@/lib/jackson';
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
    // TODO: Handle error
    console.error('saml error:', err);
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const { RelayState, SAMLResponse } = req.body;

  const { redirect_url } = await oauthController.samlResponse({
    RelayState,
    SAMLResponse,
  });

  if (!redirect_url) {
    throw new Error('No redirect URL found.');
  }

  res.redirect(302, redirect_url);
};
