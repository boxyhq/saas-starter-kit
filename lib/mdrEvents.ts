import { prisma } from '@/lib/prisma';
import { sendEvent } from '@/lib/svix';

type MdrEventType =
  | 'mdr.document.uploaded'
  | 'mdr.document.updated'
  | 'mdr.document.deleted'
  | 'mdr.compilation.started'
  | 'mdr.compilation.complete'
  | 'mdr.compilation.failed'
  | 'mdr.transmittal.issued'
  | 'mdr.inbox.received'
  | 'mdr.member.invited'
  | 'mdr.member.joined';

/**
 * Send an MDR webhook event via Svix.
 * No-op if Svix is not configured.
 */
export async function sendMdrEvent(
  teamId: string,
  eventType: MdrEventType,
  payload: object
): Promise<void> {
  try {
    // Get the Svix appId for this team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) return;

    // Svix uses team.id as the app uid — see findOrCreateApp in lib/svix.ts
    await sendEvent(teamId, eventType as any, payload as Record<string, unknown>);
  } catch {
    // Webhook delivery is non-critical — don't let failures break the main flow
  }
}
