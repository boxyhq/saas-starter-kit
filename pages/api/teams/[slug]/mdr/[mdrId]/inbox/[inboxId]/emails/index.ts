import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handleGET(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr_inbox', 'read');

  const { mdrId, inboxId } = req.query as { mdrId: string; inboxId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const inbox = await prisma.mdrEmailInbox.findFirst({
    where: { id: inboxId, mdrProjectId: mdrId },
  });
  if (!inbox) throw new ApiError(404, 'Inbox not found');

  const emails = await prisma.mdrInboxEmail.findMany({
    where: { inboxId },
    include: {
      attachments: {
        include: { mdrDocument: { select: { id: true, title: true, docNumber: true } } },
      },
    },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  });

  res.status(200).json({ data: emails });
};
