import type { NextApiRequest, NextApiResponse } from 'next';
import { getScanById } from 'models/scan';
import { getCurrentUser } from 'models/user';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query as { id: string };
  const user = await getCurrentUser(req, res);
  const scan = await getScanById(id);
  if (!scan || scan.user_id !== user.id) {
    throw new ApiError(404, 'Scan not found');
  }
  res.status(200).json({ data: scan });
};
