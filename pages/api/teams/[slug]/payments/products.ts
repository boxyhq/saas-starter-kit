import { NextApiRequest, NextApiResponse } from 'next';
import { getStripeCustomerId, getSubscriptionsWithItems } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { throwIfNoTeamAccess } from 'models/team';
import { getAllProducts } from 'models/stripeProduct';
import { getAllPrices } from 'models/stripePrice';

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
      getSubscriptionsWithItems(customerId),
      getAllProducts(),
      getAllPrices(),
    ]);

    // create a unified object with prices associated with the product
    const productsWithPrices = products.map((product: any) => {
      product.prices = prices.filter((price) => price.productId === product.id);
      return product;
    });

    // Extract Products
    const _products: Product[] = products?.map((product: any) => {
      const { id, name, prices: productPrices } = product;
      return {
        id,
        name,
        prices: productPrices.map((price: any) => ({
          id: price.id,
          currency: price.currency,
          interval: price.recurring.interval,
        })),
      };
    });

    // Extract Subscriptions
    const _subscriptions: any[] = subscriptions.data.map(
      (subscription: any) => {
        const { id, items } = subscription;
        const [subscriptionItem] = items.data;
        const product = _products.find(
          (p) => p.id === subscriptionItem.plan.product
        );

        return {
          id,
          subscriptionItemId: subscriptionItem.id,
          product,
          startDate: subscription.current_period_start * 1000,
          endDate: subscription.current_period_end * 1000,
          price: prices.find((d) => d.id === subscriptionItem.plan.id),
          status: subscription.status,
        };
      }
    );

    res.status(200).json({
      data: {
        products: productsWithPrices,
        subscriptions: _subscriptions || [],
      },
    });
  } catch (err: any) {
    const { statusCode = 503 } = err;
    res.status(statusCode).json({
      error: err.message,
    });
  }
}
