import { NextApiRequest, NextApiResponse } from 'next';

import { getStripeCustomerId } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { throwIfNoTeamAccess } from 'models/team';
import { getAllProducts } from 'models/stripeProduct';
import { getAllPrices } from 'models/stripePrice';
import { getByCustomerId } from 'models/stripeSubscription';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  const session = await getSession(req, res);
  const customerId = await getStripeCustomerId(teamMember, session);

  const [subscriptions, products, prices] = await Promise.all([
    getByCustomerId(customerId),
    getAllProducts(),
    getAllPrices(),
  ]);

  // create a unified object with prices associated with the product
  const productsWithPrices = products.map((product: any) => {
    product.prices = prices.filter((price) => price.productId === product.id);
    return product;
  });

  // Subscriptions with product and price
  const _subscriptions: any[] = subscriptions.map((subscription: any) => {
    const _price = prices.find((p) => p.id === subscription.priceId);
    if (!_price) return undefined;
    const subscriptionProduct = products.find((p) => p.id === _price.productId);

    return {
      ...subscription,
      product: subscriptionProduct,
      price: _price,
    };
  });

  res.json({
    data: {
      products: productsWithPrices,
      subscriptions: (_subscriptions || []).filter((s) => !!s),
    },
  });
};
