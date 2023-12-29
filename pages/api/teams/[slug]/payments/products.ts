import { NextApiRequest, NextApiResponse } from 'next';
import {
  getStripeCustomerId,
  getSubscriptionsWithItems,
  stripe,
} from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { throwIfNoTeamAccess } from 'models/team';

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
      stripe.products.list({
        active: true,
      }),
      stripe.prices.list({
        active: true,
      }),
    ]);

    // create a unified object with prices associated with the product
    const productsWithPrices = products.data.map((product: any) => {
      product.prices = prices.data.filter(
        (price) => price.product === product.id
      );
      return product;
    });

    // Extract Products
    const _products: Product[] = products?.data.map((product: any) => {
      const { id, name, prices: productPrices } = product;
      return {
        id,
        name,
        prices: productPrices.map((price: any) => ({
          id: price.id,
          unit_amount: price.unit_amount,
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
          price: prices.data.find((d) => d.id === subscriptionItem.plan.id),
          status: subscription.status,
        };
      }
    );

    res.status(200).json({
      data: {
        products: productsWithPrices.map((a) => {
          return {
            name: a.name,
            images: a.images,
            description: a.description,
            features: a?.features || [],
            prices: a?.prices || [],
          };
        }),
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
