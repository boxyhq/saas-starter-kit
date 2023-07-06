import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import {
  deleteTeam,
  getTeam,
  isTeamMember,
  isTeamOwner,
  updateTeam,
} from 'models/team';
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
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PUT, DELETE');
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

// Get a team by slug
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team.id))) {
    throw new ApiError(400, 'Bad request');
  }

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamOwner(session.user.id, team.id))) {
    throw new ApiError(400, `You don't have permission to do this action.`);
  }

  const updatedTeam = await updateTeam(slug as string, {
    name: req.body.name,
    slug: req.body.slug,
    domain: req.body.domain,
  });

  sendAudit({
    action: 'team.update',
    crud: 'u',
    user: session?.user,
    team,
  });

  res.status(200).json({ data: updatedTeam });
};

// Delete a team
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.slug as string;

  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const team = await getTeam({ slug });

  if (!(await isTeamOwner(session.user.id, team.id))) {
    throw new ApiError(400, `You don't have permission to do this action.`);
  }

  await deleteTeam({ slug });

  sendAudit({
    action: 'team.delete',
    crud: 'd',
    user: session.user,
    team,
  });

  res.status(200).json({ data: {} });
};
