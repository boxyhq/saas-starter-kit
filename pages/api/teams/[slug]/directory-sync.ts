import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { getTeam, isTeamMember } from 'models/team';
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
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
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
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team?.id))) {
    throw new ApiError(400, 'Bad request');
  }

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    team.id,
    env.product
  );

  if (error) {
    res.status(400).json({ error });
  }

  res.status(200).json({ data });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, provider } = req.body;
  const { slug } = req.query;

  const { directorySync } = await jackson();

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(session.user.id, team?.id))) {
    throw new ApiError(400, 'Bad request');
  }

  const { data, error } = await directorySync.directories.create({
    name,
    type: provider,
    tenant: team.id,
    product: env.product,
  });

  sendAudit({
    action: 'dsync.connection.create',
    crud: 'c',
    user: session.user,
    team,
  });

  res.status(201).json({ data, error });
};
