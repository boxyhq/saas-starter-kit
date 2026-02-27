import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import * as z from 'zod';

const schema = z.object({ helpful: z.boolean() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: { message: 'Method Not Allowed' } }); }
    const { slug } = req.query as { slug: string };
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'helpful must be boolean');
    const article = await prisma.helpArticle.findUnique({ where: { slug } });
    if (!article || article.status !== 'PUBLISHED') throw new ApiError(404, 'Article not found');
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: parsed.data.helpful
        ? { helpful: { increment: 1 } }
        : { notHelpful: { increment: 1 } },
    });
    res.status(200).json({ data: { recorded: true } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message } });
  }
}
