import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";

export const getInvitations = async (teamId: string) => {
  return await prisma.invitation.findMany({
    where: {
      teamId,
    },
  });
};

export const getInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await prisma.invitation.findUniqueOrThrow({
    where: key,
    include: {
      team: true,
    },
  });
};

export const createInvitation = async (param: {
  teamId: string;
  invitedBy: string;
  email: string;
  role: string;
}) => {
  const { teamId, invitedBy, email, role } = param;

  return await prisma.invitation.create({
    data: {
      token: uuidv4(),
      expires: new Date(),
      teamId,
      invitedBy,
      email,
      role,
    },
  });
};

export const deleteInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await prisma.invitation.delete({
    where: key,
  });
};
