import { getInvitation } from 'models/invitation';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    res.status(400).json({
      error: { message: error.message },
    });
  }
}

// Get the invitation by token
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };

  const invitation = await getInvitation({ token });

  res.status(200).json({ data: invitation });
};
