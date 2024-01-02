import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const createProduct = async (data: Stripe.Product) => {
  const product = await prisma.stripeProduct.create({
    data: {
      id: data.id,
      description: data.description || '',
      image: data.images.length > 0 ? data.images[0] : '',
      metadata: data.metadata,
      name: data.name,
      unitLabel: data.unit_label,
      created: new Date(data.created * 1000),
    },
  });
  return product;
};

export const deleteAllProducts = async () => {
  const products = await prisma.stripeProduct.deleteMany({});
  return products;
};

export const getAllProducts = async () => {
  const products = await prisma.stripeProduct.findMany({});
  return products;
};
