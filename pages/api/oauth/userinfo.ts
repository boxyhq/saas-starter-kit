import { ApiError } from '@/lib/errors';
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
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
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
    throw new ApiError(401, 'Unauthorized');
  }

  const profile = await oauthController.userInfo(token);

  res.json(profile);
};
