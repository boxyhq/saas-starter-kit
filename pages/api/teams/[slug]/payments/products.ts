import { NextApiRequest, NextApiResponse } from 'next';
import { getStripeCustomerId } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { throwIfNoTeamAccess } from 'models/team';
import { getAllProducts } from 'models/stripeProduct';
import { getAllPrices } from 'models/stripePrice';
import { getByCustomerId } from 'models/stripeSubscription';

interface Product {
  id: string;
  name: string;
  prices: Price[];
}

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  interval: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    const session = await getSession(req, res);
    const teamMember = await throwIfNoTeamAccess(req, res);
    if (!session?.user?.id) throw Error('Could not get user');
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

    // Extract Subscriptions
    const _subscriptions: any[] = subscriptions.map((subscription: any) => {
      const _price = prices.find((p) => p.id === subscription.priceId);
      if (!_price) return undefined;
      const subscriptionProduct = products.find(
        (p) => p.id === _price.productId
      );

      return {
        ...subscription,
        product: subscriptionProduct,
        price: _price,
      };
    });

    res.status(200).json({
      data: {
        products: productsWithPrices,
        subscriptions: (_subscriptions || []).filter((s) => !!s),
      },
    });
  } catch (err: any) {
    const { statusCode = 503 } = err;
    res.status(statusCode).json({
      error: err.message,
    });
  }
}
