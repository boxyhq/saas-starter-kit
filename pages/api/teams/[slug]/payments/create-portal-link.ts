import { getSession } from '@/lib/session';
import { stripe, getURL, getStripeCustomerId } from '@/lib/stripe';
import { throwIfNoTeamAccess } from 'models/team';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const session = await getSession(req, res);
      const teamMember = await throwIfNoTeamAccess(req, res);
      if (!session?.user?.id) throw Error('Could not get user');
      const customerId = await getStripeCustomerId(teamMember, session);
      const sess = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${getURL()}teams/${teamMember.team.slug}/payments`,
      });
      return res.status(200).json({ url: sess.url });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
  }
}
