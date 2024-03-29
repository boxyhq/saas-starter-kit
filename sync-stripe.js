const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

/**
 * Synchronizes data between a database and the Stripe API.
 * Retrieves active products and prices from Stripe, deletes existing data in the database,
 * and inserts the new data. Prints the number of synced products and prices.
 *
 * @returns {Promise<void>} - A promise that resolves once the synchronization is complete.
 */
const sync = async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Starting sync with Stripe');
    const stripe = getStripeInstance();

    // Get all active products and prices
    const [products, prices] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true }),
    ]);

    if (prices.data.length > 0 && products.data.length > 0) {
      const operations = [
        ...cleanup(prisma),
        ...seedServices(products.data, prisma),
        ...seedPrices(prices.data, prisma),
      ];
      await prisma.$transaction(operations);
      await printStats(prisma);

      console.log('Sync completed successfully');
      process.exit(0);
    } else {
      if (prices.data.length === 0) {
        throw new Error('No prices found on Stripe');
      } else {
        throw new Error('No products found on Stripe');
      }
    }
  } catch (error) {
    console.error('Error syncing with Stripe:', error);
    process.exit(1);
  }
};

sync();

// handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

async function printStats(prisma) {
  const [productCount, priceCount] = await Promise.all([
    prisma.service.count(),
    prisma.price.count(),
  ]);

  console.log('Products synced:', productCount);
  console.log('Prices synced:', priceCount);
}

function cleanup(prisma) {
  return [
    // delete all prices from the database
    prisma.price.deleteMany({}),
    // Delete all products and prices from the database
    prisma.service.deleteMany({}),
  ];
}

function getStripeInstance() {
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15',
    });
    return stripe;
  } else {
    throw new Error('STRIPE_SECRET_KEY environment variable not set');
  }
}

function seedPrices(prices, prisma) {
  return prices.map((data) =>
    prisma.price.create({
      data: {
        id: data.id,
        billingScheme: data.billing_scheme,
        currency: data.currency,
        serviceId: data.product,
        amount: data.unit_amount ? data.unit_amount / 100 : undefined,
        metadata: data.recurring,
        type: data.type,
        created: new Date(data.created * 1000),
      },
    })
  );
}

function seedServices(products, prisma) {
  return products.map((data) =>
    prisma.service.create({
      data: {
        id: data.id,
        description: data.description || '',
        features: (data.features || []).map((a) => a.name),
        image: data.images.length > 0 ? data.images[0] : '',
        name: data.name,
        created: new Date(data.created * 1000),
      },
    })
  );
}
