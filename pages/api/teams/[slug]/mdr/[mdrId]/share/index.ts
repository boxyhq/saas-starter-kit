import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, createShareLinkSchema } from '@/lib/zod';
import bcrypt from 'bcryptjs';
import env from '@/lib/env';

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
      case 'POST':
        await handlePOST(req, res);
        break;
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
  throwIfNotAllowed(user, 'mdr', 'read');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const links = await prisma.mdrShareLink.findMany({
    where: { mdrProjectId: mdrId },
    orderBy: { createdAt: 'desc' },
    include: { accesses: { orderBy: { accessedAt: 'desc' }, take: 3 } },
  });

  // Never return the password hash
  const safeLinks = links.map(({ passwordHash, ...link }) => ({
    ...link,
    hasPassword: !!passwordHash,
  }));

  res.status(200).json({ data: safeLinks });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'EDITOR');

  const { compilationId, expiresInHours, password, maxDownloads } =
    validateWithSchema(createShareLinkSchema, req.body);

  // Verify compilation belongs to this project
  await prisma.mdrCompilation.findFirstOrThrow({
    where: { id: compilationId, mdrProjectId: mdrId },
  });

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const link = await prisma.mdrShareLink.create({
    data: {
      mdrProjectId: mdrId,
      compilationId,
      passwordHash,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      maxDownloads: maxDownloads ?? null,
      createdBy: user.id,
    },
  });

  const { passwordHash: _passwordHash, ...safeLink } = link;
  const shareUrl = `${env.appUrl}/mdr/share/${link.token}`;

  res.status(201).json({ data: { ...safeLink, shareUrl, hasPassword: !!passwordHash } });
};
