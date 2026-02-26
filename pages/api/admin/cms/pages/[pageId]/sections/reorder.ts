import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const reorderSchema = z.object({
  sections: z.array(z.object({ id: z.string().uuid(), order: z.number().int() })).min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', 'PATCH');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    const parsed = reorderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: { message: parsed.error.errors[0]?.message } });
    }

    await prisma.$transaction(
      parsed.data.sections.map(({ id, order }) =>
        prisma.pageSection.update({ where: { id }, data: { order } })
      )
    );

    res.status(200).json({ data: { reordered: parsed.data.sections.length } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
