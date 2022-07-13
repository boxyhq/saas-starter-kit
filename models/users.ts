import type { Session } from "next-auth";

import { prisma } from "@lib/prisma";
import { slugify } from "@lib/common";

const getUserBySession = async (session: Session | null) => {
  if (session === null || session.user === null) {
    return null;
  }

  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await getUser(id);
};

const getUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const createUserAndTenant = async (param: {
  name: string;
  email: string;
  tenant: string;
}) => {
  const { name, email, tenant } = param;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      tenants: {
        create: {
          name: tenant,
          slug: slugify(tenant),
        },
      },
    },
    include: {
      tenants: true,
    },
  });

  await prisma.tenantUser.create({
    data: {
      tenantId: user.tenants[0].id,
      userId: user.id,
      role: "owner",
    },
  });

  return user;
};

const createUser = async (param: {
  name: string;
  email: string;
  tenant: string;
}) => {
  const { name, email, tenant } = param;

  return await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: new Date(),
      tenantUsers: {
        create: {
          tenantId: tenant,
        },
      },
    },
  });
};

const users = {
  getUserBySession,
  getUser,
  getUserByEmail,
  createUserAndTenant,
  createUser,
};

export default users;
