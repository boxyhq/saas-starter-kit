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
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: req.body.priceId,
            // For metered billing, do not pass quantity
            quantity: req.body.quantity || undefined,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: `${getURL()}teams/${teamMember.team.slug}/payments`,
        cancel_url: `${getURL()}teams/${teamMember.team.slug}/payments`,
      });
      return res.status(200).json({ data: checkoutSession });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
  }
}
