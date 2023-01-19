import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export const createUser = async (param: {
  name: string;
  email: string;
  password?: string;
}) => {
  const { name, email, password } = param;

  return await prisma.user.create({
    data: {
      name,
      email,
      password: password ? password : '',
      emailVerified: new Date(),
    },
  });
};

export const getUser = async (key: { id: string } | { email: string }) => {
  return await prisma.user.findUnique({
    where: key,
  });
};

export const getUserBySession = async (session: Session | null) => {
  if (session === null || session.user === null) {
    return null;
  }

  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await getUser({ id });
};

export const deleteUser = async (key: { id: string } | { email: string }) => {
  return await prisma.user.delete({
    where: key,
  });
};
