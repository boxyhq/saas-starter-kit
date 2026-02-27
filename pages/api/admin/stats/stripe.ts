import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';
import { stripe } from '@/lib/stripe';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await requireSiteAdmin(req, res);

    if (!env.stripe.secretKey) {
      return res.status(200).json({
        data: { available: false, reason: 'Stripe not configured' },
      });
    }

    // Fetch all active subscriptions (auto-paginate)
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      expand: ['data.items.data.price'],
      limit: 100,
    });

    let mrr = 0;
    const planCounts: Record<string, { name: string; count: number; mrr: number }> = {};

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        const product = typeof price.product === 'string' ? price.product : (price.product as any)?.id;
        const amount = price.unit_amount ?? 0;
        const interval = price.recurring?.interval;
        const intervalCount = price.recurring?.interval_count ?? 1;

        // Normalise to monthly
        let monthlyAmount = amount / 100;
        if (interval === 'year') monthlyAmount = monthlyAmount / 12 / intervalCount;
        else if (interval === 'week') monthlyAmount = monthlyAmount * (52 / 12) / intervalCount;
        else if (interval === 'day') monthlyAmount = monthlyAmount * (365 / 12) / intervalCount;
        else monthlyAmount = monthlyAmount / intervalCount; // month

        mrr += monthlyAmount;

        const key = price.id;
        if (!planCounts[key]) {
          planCounts[key] = {
            name: (price as any).nickname ?? product ?? price.id,
            count: 0,
            mrr: 0,
          };
        }
        planCounts[key].count += 1;
        planCounts[key].mrr += monthlyAmount;
      }
    }

    res.status(200).json({
      data: {
        available: true,
        mrr: Math.round(mrr * 100) / 100,
        activeSubscriptions: subscriptions.data.length,
        planDistribution: Object.values(planCounts).sort((a, b) => b.count - a.count),
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
