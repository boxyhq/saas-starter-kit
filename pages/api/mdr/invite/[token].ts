import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { mdrAuditEvent } from '@/lib/mdrAudit';
import { sendMdrEvent } from '@/lib/mdrEvents';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    const session = await getServerSession(req, res, getAuthOptions());
    if (!session?.user?.id) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { token } = req.query as { token: string };

    const invitation = await prisma.mdrProjectInvitation.findUnique({
      where: { token },
      include: { mdrProject: { include: { team: true } } },
    });

    if (!invitation) {
      throw new ApiError(404, 'Invitation not found.');
    }

    if (invitation.acceptedAt) {
      throw new ApiError(409, 'This invitation has already been accepted.');
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(410, 'This invitation has expired.');
    }

    // Verify invitee email matches session user
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    });

    if (user.email !== invitation.email) {
      throw new ApiError(
        403,
        'This invitation was sent to a different email address.'
      );
    }

    // Accept invitation
    const [member] = await prisma.$transaction([
      prisma.mdrProjectMember.upsert({
        where: {
          mdrProjectId_userId: {
            mdrProjectId: invitation.mdrProjectId,
            userId: user.id,
          },
        },
        create: {
          mdrProjectId: invitation.mdrProjectId,
          userId: user.id,
          role: invitation.role,
          invitedBy: invitation.invitedBy,
        },
        update: { role: invitation.role },
      }),
      prisma.mdrProjectInvitation.update({
        where: { token },
        data: { acceptedAt: new Date() },
      }),
    ]);

    const team = invitation.mdrProject.team;
    await mdrAuditEvent(
      team.id,
      team.name,
      user.id,
      user.name ?? '',
      'mdr_member.joined',
      {
        id: invitation.mdrProjectId,
        name: invitation.mdrProject.name,
        type: 'mdr_project',
      }
    );

    await sendMdrEvent(team.id, 'mdr.member.joined', {
      mdrProjectId: invitation.mdrProjectId,
      userId: user.id,
      role: invitation.role,
    });

    const slug = team.slug;
    const redirectUrl = `/teams/${slug}/mdr/${invitation.mdrProjectId}`;

    res.status(200).json({ data: { member, redirectUrl } });
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
