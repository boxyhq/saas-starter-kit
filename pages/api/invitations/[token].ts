import { getInvitation, isInvitationExpired } from 'models/invitation';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import { getInvitationSchema, validateWithSchema } from '@/lib/zod';

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
  const { token } = validateWithSchema(
    getInvitationSchema,
    req.query as { token: string }
  );

  const invitation = await getInvitation({ token });

  if (await isInvitationExpired(invitation.expires)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  recordMetric('invitation.fetched');

  res.status(200).json({ data: invitation });
};
