import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { prisma } from '@/lib/prisma';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await requireSiteAdmin(req, res);
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: { message: 'Method Not Allowed' } }); }
    const { articleId } = req.query as { articleId: string };
    const article = await prisma.helpArticle.update({ where: { id: articleId }, data: { status: 'DRAFT' } });
    res.status(200).json({ data: article });
  } catch (error: any) { res.status(error.status || 500).json({ error: { message: error.message } }); }
}
