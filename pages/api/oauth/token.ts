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
    console.error('token error:', err);
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const token = await oauthController.token(req.body);

  res.json(token);
};
