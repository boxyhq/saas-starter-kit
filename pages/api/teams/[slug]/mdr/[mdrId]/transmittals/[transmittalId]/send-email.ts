import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { assertMdrOwnership } from '@/lib/mdr';
import { getPresignedGetUrl } from '@/lib/s3';
import { sendEmail } from '@/lib/email/sendEmail';
import env from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await throwIfNoTeamAccess(req, res);
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: { message: `Method ${req.method} Not Allowed` } });
    }
    await handlePOST(req, res);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

  const user = await getCurrentUserWithTeam(req, res);
  throwIfNotAllowed(user, 'mdr', 'update');

  const { mdrId, transmittalId } = req.query as { mdrId: string; transmittalId: string };
  await assertMdrOwnership(mdrId, user.team.id);

  const transmittal = await prisma.mdrTransmittal.findFirst({
    where: { id: transmittalId, mdrProjectId: mdrId },
    include: { mdrProject: { select: { name: true, clientName: true } } },
  });

  if (!transmittal) throw new ApiError(404, 'Transmittal not found');
  if (transmittal.status !== 'ISSUED') {
    throw new ApiError(400, 'Only issued transmittals can be emailed');
  }
  if (!transmittal.toEmail) {
    throw new ApiError(400, 'This transmittal has no recipient email address');
  }
  if (!transmittal.coverSheetS3Key) {
    throw new ApiError(400, 'No cover sheet available — re-issue the transmittal to generate one');
  }

  // Generate a 24-hour presigned download URL for the cover sheet PDF
  const filename = `Transmittal-${transmittal.transmittalNumber}.pdf`;
  const downloadUrl = await getPresignedGetUrl(transmittal.coverSheetS3Key, filename, 86400);

  const projectName = transmittal.mdrProject.name;
  const senderName = transmittal.fromName || user.name || user.team.name;

  await sendEmail({
    to: transmittal.toEmail,
    subject: `Transmittal ${transmittal.transmittalNumber} — ${projectName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">Document Transmittal</h2>
  <p>Dear ${transmittal.toName || 'Sir/Madam'},</p>
  <p>Please find attached the document transmittal <strong>${transmittal.transmittalNumber}</strong> for project <strong>${projectName}</strong>.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; width: 40%;">Transmittal Number</td>
      <td style="padding: 8px 12px;">${transmittal.transmittalNumber}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold;">Purpose</td>
      <td style="padding: 8px 12px;">${transmittal.purpose.replace(/_/g, ' ')}</td>
    </tr>
    ${transmittal.mdrProject.clientName ? `
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold;">Client</td>
      <td style="padding: 8px 12px;">${transmittal.mdrProject.clientName}</td>
    </tr>` : ''}
    ${transmittal.issuedAt ? `
    <tr>
      <td style="padding: 8px 12px; font-weight: bold;">Date Issued</td>
      <td style="padding: 8px 12px;">${new Date(transmittal.issuedAt).toLocaleDateString()}</td>
    </tr>` : ''}
  </table>
  ${transmittal.notes ? `<p><strong>Notes:</strong><br>${transmittal.notes}</p>` : ''}
  <p style="margin: 30px 0;">
    <a href="${downloadUrl}"
       style="background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Download Cover Sheet
    </a>
  </p>
  <p style="font-size: 12px; color: #666;">
    This download link will expire in 24 hours.
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #999;">
    Sent by ${senderName} via ${user.team.name}
  </p>
</body>
</html>
    `.trim(),
  });

  res.status(200).json({ data: { sent: true } });
};
