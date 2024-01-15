import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';

export const stripe = new Stripe(env.stripe.secretKey ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15'
});

export async function getStripeCustomerId(teamMember, session?: any) {
  let customerId = '';
  if (!teamMember.team.stripeCustomerId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) customerData.email = session?.user?.email;
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await updateTeam(teamMember.team.slug, {
      stripeCustomerId: customer.id,
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.stripeCustomerId;
  }
  return customerId;
}
