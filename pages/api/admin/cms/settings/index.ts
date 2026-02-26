import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    switch (req.method) {
      case 'GET': await handleGET(req, res); break;
      case 'PATCH': await handlePATCH(req, res); break;
      default:
        res.setHeader('Allow', 'GET, PATCH');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (_req: NextApiRequest, res: NextApiResponse) => {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  // Convert to key→value map for convenience
  const map: Record<string, unknown> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  res.status(200).json({ data: map });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const updates = req.body as Record<string, unknown>;
  if (typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: { message: 'Body must be an object of key→value pairs' } });
  }

  await prisma.$transaction(
    Object.entries(updates).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value as any },
        update: { value: value as any },
      })
    )
  );

  res.status(200).json({ data: { updated: Object.keys(updates).length } });
};
