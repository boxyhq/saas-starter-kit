import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { getPresignedGetUrl } from '@/lib/s3';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

// GET: return metadata about the share link (project name, size, etc.)
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };

  const link = await prisma.mdrShareLink.findUnique({
    where: { token },
    include: {
      mdrProject: { select: { name: true, clientName: true } },
      compilation: { select: { fileSize: true, completedAt: true, status: true } },
    },
  });

  if (!link) throw new ApiError(404, 'Share link not found.');
  if (link.expiresAt < new Date()) throw new ApiError(410, 'This share link has expired.');
  if (link.maxDownloads && link.downloadCount >= link.maxDownloads) {
    throw new ApiError(410, 'This share link has reached its download limit.');
  }

  res.status(200).json({
    data: {
      projectName: link.mdrProject.name,
      clientName: link.mdrProject.clientName,
      compilationDate: link.compilation.completedAt,
      fileSize: link.compilation.fileSize?.toString(),
      hasPassword: !!link.passwordHash,
      expiresAt: link.expiresAt,
    },
  });
};

// POST: validate password + return presigned download URL
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };
  const { password } = req.body as { password?: string };

  const link = await prisma.mdrShareLink.findUnique({
    where: { token },
    include: {
      compilation: { select: { s3Key: true, status: true } },
      mdrProject: { select: { name: true } },
    },
  });

  if (!link) throw new ApiError(404, 'Share link not found.');
  if (link.expiresAt < new Date()) throw new ApiError(410, 'This share link has expired.');
  if (link.maxDownloads && link.downloadCount >= link.maxDownloads) {
    throw new ApiError(410, 'This share link has reached its download limit.');
  }

  if (link.passwordHash) {
    if (!password) throw new ApiError(401, 'Password required.');
    const valid = await bcrypt.compare(password, link.passwordHash);
    if (!valid) throw new ApiError(401, 'Incorrect password.');
  }

  if (!link.compilation.s3Key) {
    throw new ApiError(400, 'Compilation is not available for download yet.');
  }

  const downloadUrl = await getPresignedGetUrl(
    link.compilation.s3Key,
    `${link.mdrProject.name}.pdf`
  );

  // Record access and increment download count
  await prisma.$transaction([
    prisma.mdrShareLink.update({
      where: { id: link.id },
      data: { downloadCount: { increment: 1 } },
    }),
    prisma.mdrShareLinkAccess.create({
      data: {
        shareLinkId: link.id,
        ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? null,
        userAgent: (req.headers['user-agent'] as string) ?? null,
      },
    }),
  ]);

  res.status(200).json({ data: { downloadUrl } });
};
