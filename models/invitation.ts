import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { Invitation, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
  const invitation = await prisma.invitation.findUnique({
    where: key,
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found.');
  }

  return invitation;
};

export const createInvitation = async (param: {
  teamId: string;
  invitedBy: string;
  email: string;
  role: Role;
}) => {
  const { teamId, invitedBy, email, role } = param;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.invitation.create({
    data: {
      token: uuidv4(),
      expires,
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

export const isInvitationExpired = async (invitation: Invitation) => {
  return invitation.expires.getTime() < Date.now();
};
