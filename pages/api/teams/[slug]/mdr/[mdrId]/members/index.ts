import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { validateWithSchema, createMdrInvitationSchema } from '@/lib/zod';
import { sendEmail } from '@/lib/email/sendEmail';
import { logMdrActivity } from '@/lib/mdrActivityLog';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await throwIfNoTeamAccess(req, res);

    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'read');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

  const [members, invitations] = await Promise.all([
    prisma.mdrProjectMember.findMany({
      where: { mdrProjectId: mdrId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    }),
    prisma.mdrProjectInvitation.findMany({
      where: { mdrProjectId: mdrId, acceptedAt: null, expiresAt: { gt: new Date() } },
    }),
  ]);

  res.status(200).json({ data: { members, invitations } });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'create');

  const { mdrId } = req.query as { mdrId: string };
  await assertMdrOwnership(mdrId, user.team.id);
  await assertMdrAccess(mdrId, user.id, user.team.id, 'ADMIN');

  const { email, role } = validateWithSchema(createMdrInvitationSchema, req.body);

  const project = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrId },
    select: { name: true },
  });

  // Expire existing invitation for this email
  await prisma.mdrProjectInvitation.deleteMany({
    where: { mdrProjectId: mdrId, email, acceptedAt: null },
  });

  const invitation = await prisma.mdrProjectInvitation.create({
    data: {
      mdrProjectId: mdrId,
      email,
      role,
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send invitation email
  const inviteUrl = `${env.appUrl}/mdr/invite/${invitation.token}`;
  await sendEmail({
    to: email,
    subject: `You've been invited to join MDR project: ${project.name}`,
    html: `
      <p>Hi,</p>
      <p><strong>${user.name}</strong> has invited you to join the MDR project <strong>${project.name}</strong> as a <strong>${role}</strong>.</p>
      <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
      <p>This invitation expires in 7 days.</p>
    `,
  });

  logMdrActivity({ mdrId, userId: user.id, action: 'member_invited', details: { email, role } });
  res.status(201).json({ data: invitation });
};
