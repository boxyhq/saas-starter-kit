import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';

export const stripe = new Stripe(env.stripe.secretKey ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2024-04-10',
});

export async function getStripeCustomerId(teamMember, session?: any) {
  let customerId = '';
  if (!teamMember.team.billingId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) {
      customerData.email = session?.user?.email;
    }
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await updateTeam(teamMember.team.slug, {
      billingId: customer.id,
      billingProvider: 'stripe',
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.billingId;
  }
  return customerId;
}
