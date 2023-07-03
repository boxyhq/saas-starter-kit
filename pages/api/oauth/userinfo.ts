import jackson from '@/lib/jackson';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGET(req, res);
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    // TODO: Handle error
    console.error('token error:', err);
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    let arr: string[] = [];
    arr = arr.concat(req.query.access_token || '');

    if (arr[0].length > 0) {
      token = arr[0];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const profile = await oauthController.userInfo(token);

  return res.json(profile);
};
