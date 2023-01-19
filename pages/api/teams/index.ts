import { slugify } from '@/lib/common';
import { getSession } from '@/lib/session';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    case 'POST':
      return handlePOST(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get teams
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const teams = await getTeams(session?.user.id as string);

  return res.status(200).json({ data: teams, error: null });
};

// Create a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.body;

  const session = await getSession(req, res);
  const slug = slugify(name);

  if (await isTeamExists({ slug })) {
    return res.status(200).json({
      data: null,
      error: {
        message: 'A team with the name already exists.',
      },
    });
  }

  const team = await createTeam({
    userId: session?.user?.id as string,
    name,
    slug,
  });

  return res.status(200).json({ data: team, error: null });
};
