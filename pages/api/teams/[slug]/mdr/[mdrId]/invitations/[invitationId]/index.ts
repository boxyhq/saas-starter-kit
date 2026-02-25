import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', 'DELETE');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'delete');

    const { mdrId, invitationId } = req.query as {
      mdrId: string;
      invitationId: string;
    };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

    await prisma.mdrProjectInvitation.delete({ where: { id: invitationId } });

    res.status(204).end();
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
