import { createStripeTeam, getByTeamId } from 'models/stripeTeam';
import Stripe from 'stripe';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? '',
  {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: '2022-11-15',
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'saas-starter-kit',
      version: '0.1.0',
    },
  }
);

export const getURL = () => {
  let url = process?.env?.APP_URL || 'http://localhost:4002/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export async function getStripeCustomerId(teamMember, session?: any) {
  let customerId = '';
  const stripeTeam = await getByTeamId(teamMember.teamId);
  if (!stripeTeam) {
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
    await createStripeTeam(teamMember.teamId, customer.id);
    customerId = customer.id;
  } else {
    customerId = stripeTeam.customerId;
  }
  return customerId;
}

export async function getSubscriptionsWithItems(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });
  return subscriptions;
}
