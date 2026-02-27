import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order: z.number().int() })),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });

    await prisma.$transaction(
      parsed.data.items.map(({ id, order }) =>
        prisma.helpCategory.update({ where: { id }, data: { order } })
      )
    );
    res.status(200).json({ data: { updated: parsed.data.items.length } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
