import { prisma } from '@/lib/prisma';
import { permissions } from '@/lib/roles';
import { getSession } from '@/lib/session';
import { getTeam, throwIfNoTeamAccess } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        return await handleGET(req, res);
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get permissions for a team for the current user
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const teamRole = await prisma.teamMember.findFirstOrThrow({
    where: {
      userId: session?.user.id,
      team: {
        slug: req.query.slug as string,
      },
    },
    select: {
      role: true,
    },
  });

  return res.json({ data: permissions[teamRole.role] });
};
