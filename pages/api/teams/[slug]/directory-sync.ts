import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { getSession } from '@/lib/session';
import { getTeam, isTeamMember } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await handleGET(req, res);
    case 'POST':
      return await handlePOST(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query as { slug: string };

  const session = await getSession(req, res);

  if (!session) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const team = await getTeam({ slug });

  if (!(await isTeamMember(session.user.id, team?.id))) {
    return res.status(400).json({
      error: { message: 'Bad request.' },
    });
  }

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    team.id,
    env.product
  );

  if (error) {
    return res.status(400).json({ error });
  }

  return res.status(200).json({ data });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, provider } = req.body;
  const { slug } = req.query;

  const { directorySync } = await jackson();

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: 'Bad request.' },
    });
  }

  const { data, error } = await directorySync.directories.create({
    name,
    type: provider,
    tenant: team.id,
    product: env.product,
  });

  return res.status(201).json({ data, error });
};
