import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { validateWithSchema, updateBrandingSchema } from '@/lib/zod';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, PATCH');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'team', 'read');

  const branding = await prisma.teamBranding.findUnique({
    where: { teamId: user.team.id },
  });

  res.status(200).json({ data: branding });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'team', 'update');

  const { logoPlacements, primaryColor } = validateWithSchema(
    updateBrandingSchema,
    req.body
  );

  const branding = await prisma.teamBranding.upsert({
    where: { teamId: user.team.id },
    create: {
      teamId: user.team.id,
      logoPlacements: logoPlacements ? JSON.stringify(logoPlacements) : null,
      primaryColor: primaryColor ?? null,
    },
    update: {
      ...(logoPlacements !== undefined
        ? { logoPlacements: JSON.stringify(logoPlacements) }
        : {}),
      ...(primaryColor !== undefined ? { primaryColor } : {}),
    },
  });

  res.status(200).json({ data: branding });
};
