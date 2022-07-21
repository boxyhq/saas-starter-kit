import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { Tenant, User } from "@prisma/client";

const getInvitations = async (tenantId: string) => {
  return await prisma.invitation.findMany({
    where: {
      tenantId,
    },
  });
};

const createInvitation = async (param: {
  tenant: Tenant;
  user: User;
  email: string;
  role: string;
}) => {
  const { tenant, user, email, role } = param;

  return await prisma.invitation.create({
    data: {
      tenantId: tenant.id,
      invitedBy: user.id,
      token: uuidv4(),
      expires: new Date(),
      email,
      role,
    },
  });
};

const getInvitation = async (token: string) => {
  return await prisma.invitation.findUnique({
    where: {
      token,
    },
    include: {
      tenant: true,
    },
  });
};

const deleteInvitation = async (token: string) => {
  return await prisma.invitation.delete({
    where: {
      token,
    },
  });
};

const invitations = {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
};

export default invitations;
