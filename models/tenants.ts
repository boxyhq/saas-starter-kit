import type { Role } from "types";
import type { Tenant } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getTenants = async (
  userId: string | null
): Promise<Tenant[] | null> => {
  if (userId === null) {
    return null;
  }

  return await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });
};

export const getTenant = async (key: { id: string } | { slug: string }) => {
  return await prisma.tenant.findUniqueOrThrow({
    where: key,
  });
};

export const getTenantMembers = async (slug: string) => {
  return await prisma.tenantUser.findMany({
    where: {
      tenant: {
        slug,
      },
    },
    include: {
      user: true,
    },
  });
};

export const addUser = async (params: {
  userId: string;
  tenantId: string;
  role: Role;
}) => {
  const { userId, tenantId, role } = params;

  return await prisma.tenantUser.create({
    data: {
      userId,
      tenantId,
      role,
    },
  });
};

export async function isTenantMember(userId: string, tenantId: string) {
  return (await prisma.tenantUser.findFirstOrThrow({
    where: {
      userId,
      tenantId,
    },
  }))
    ? true
    : false;
}

const tenants = {
  getTenants,
  getTenantMembers,
  addUser,
  getTenant,
  isTenantMember,
};

export default tenants;
