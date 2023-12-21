import { getSession } from '@/lib/session';
import { stripe, getURL } from '@/lib/stripe';
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
      let customerId = '';
      const existingCustomer = await stripe.customers.search({
        query: `metadata['teamId']: '${teamMember.teamId}' AND metadata['userId']: '${session?.user.id}' AND email: '${session?.user.email}'`,
      });
      if (existingCustomer.data.length == 0) {
        const customerData: {
          metadata: { userId: string; teamId: string };
          email?: string;
        } = {
          metadata: {
            userId: session?.user.id,
            teamId: teamMember.teamId,
          },
        };
        if (session?.user?.email) customerData.email = session?.user?.email;
        const customer = await stripe.customers.create({
          ...customerData,
          name: session?.user?.name as string,
        });
        customerId = customer.id;
      } else {
        customerId = existingCustomer.data[0].id;
      }
      const sess = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${getURL()}teams/${teamMember.team.slug}/payments`,
      });
      return res.status(200).json({ url: sess.url });
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
  }
}
