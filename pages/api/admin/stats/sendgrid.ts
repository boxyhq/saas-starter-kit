import type { NextApiRequest, NextApiResponse } from 'next';
import { requireSiteAdmin } from '@/lib/guards/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await requireSiteAdmin(req, res);

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        data: { available: false, reason: 'SENDGRID_API_KEY not configured' },
      });
    }

    // SendGrid Stats API — last 30 days
    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const sgRes = await fetch(
      `https://api.sendgrid.com/v3/stats?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&aggregated_by=day`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!sgRes.ok) {
      const text = await sgRes.text();
      return res.status(200).json({
        data: { available: false, reason: `SendGrid API error: ${sgRes.status} ${text.slice(0, 100)}` },
      });
    }

    const sgData: Array<{ date: string; stats: Array<{ metrics: Record<string, number> }> }> =
      await sgRes.json();

    // Aggregate totals
    const totals = {
      requests: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      bounces: 0,
      spam_reports: 0,
    };

    for (const day of sgData) {
      for (const stat of day.stats) {
        for (const [key, value] of Object.entries(stat.metrics)) {
          if (key in totals) {
            (totals as any)[key] += value;
          }
        }
      }
    }

    res.status(200).json({
      data: {
        available: true,
        period: { start: fmt(startDate), end: fmt(endDate) },
        totals,
        daily: sgData.map((d) => ({
          date: d.date,
          metrics: d.stats[0]?.metrics ?? {},
        })),
      },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
