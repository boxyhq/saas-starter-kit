import { prisma } from '@/lib/prisma';

export const deleteManySessions = async ({ where }) => {
  return await prisma.session.deleteMany({
    where,
  });
};

export const findFirstSessionOrThrown = async ({ where }) => {
  return await prisma.session.findFirstOrThrow({
    where,
  });
};

export const findManySessions = async ({ where }) => {
  return await prisma.session.findMany({
    where,
  });
};

export const deleteSession = async ({ where }) => {
  return await prisma.session.delete({
    where,
  });
};
