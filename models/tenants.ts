import { prisma } from "@lib/prisma";
import { Invitation, Tenant } from "@prisma/client";

const getTenants = async (userId: string | null): Promise<Tenant[] | null> => {
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

const getTenantBySlug = async (slug: string) => {
  return await prisma.tenant.findUnique({
    where: {
      slug,
    },
  });
};

const getTenantMembers = async (slug: string) => {
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

const addUserWithInvitation = async (
  userId: string,
  invitation: Invitation
) => {
  return await prisma.tenantUser.create({
    data: {
      userId,
      tenantId: invitation.tenantId,
      role: invitation.role,
    },
  });
};

const tenants = {
  getTenants,
  getTenantBySlug,
  getTenantMembers,
  addUserWithInvitation,
};

export default tenants;
