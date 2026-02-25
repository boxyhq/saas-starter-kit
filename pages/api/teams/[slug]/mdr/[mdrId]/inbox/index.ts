import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership, assertTeamNotSuspended } from '@/lib/mdr';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'POST': await handlePOST(req, res); break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr_inbox', 'read');
  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const inboxes = await prisma.mdrEmailInbox.findMany({
    where: { mdrProjectId: mdrId },
    include: { _count: { select: { emails: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({ data: inboxes });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');
  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr_inbox', 'create');
  await assertTeamNotSuspended(user.team.id);

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const inboundDomain = env.mdr.inboundEmailDomain;
  if (!inboundDomain) throw new ApiError(500, 'Inbound email domain not configured');

  // Generate unique address: mdr-{shortId}@inbound.domain
  const shortId = mdrId.slice(0, 8);
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const emailAddress = `mdr-${shortId}-${randomSuffix}@${inboundDomain}`;

  const inbox = await prisma.mdrEmailInbox.create({
    data: {
      teamId: user.team.id,
      mdrProjectId: mdrId,
      emailAddress,
    },
  });

  res.status(201).json({ data: inbox });
};
