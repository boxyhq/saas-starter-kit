import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const createPrice = async (data: Stripe.Price) => {
  const price = await prisma.stripePrice.create({
    data: {
      id: data.id,
      billingScheme: data.billing_scheme,
      created: new Date(data.created * 1000),
      currency: data.currency,
      customUnitAmount: data.custom_unit_amount
        ? data.custom_unit_amount.toString()
        : null,
      livemode: data.livemode,
      lookupKey: data.lookup_key,
      metadata: data.metadata,
      nickname: data.nickname,
      productId: data.product as string,
      recurring: JSON.stringify(data.recurring || {}),
      tiersMode: data.tiers_mode ? data.tiers_mode.toString() : '',
      type: data.type,
      unitAmount: data.unit_amount ? data.unit_amount.toString() : null,
      unitAmountDecimal: data.unit_amount_decimal,
    },
  });
  return price;
};

export const deleteAllPrices = async () => {
  const prices = await prisma.stripePrice.deleteMany({});
  return prices;
};
