import { Client } from '@retracedhq/retraced';
import type { Event, CRUD } from '@retracedhq/retraced';
import env from '@/lib/env';

let retracedClient: Client | null = null;

function getRetracedClient(): Client | null {
  if (!env.retraced.apiKey || !env.retraced.projectId || !env.retraced.url) {
    return null;
  }
  if (!retracedClient) {
    retracedClient = new Client({
      endpoint: env.retraced.url,
      apiKey: env.retraced.apiKey,
      projectId: env.retraced.projectId,
    });
  }
  return retracedClient;
}

function deriveCrud(action: string): CRUD {
  if (action.endsWith('.created') || action.endsWith('.invited')) return 'c';
  if (action.endsWith('.deleted') || action.endsWith('.removed')) return 'd';
  if (action.endsWith('.fetched')) return 'r';
  return 'u';
}

/**
 * Send an MDR-specific audit event to Retraced.
 * No-op if Retraced is not configured.
 */
export async function mdrAuditEvent(
  teamId: string,
  teamName: string,
  userId: string,
  userName: string,
  action: string,
  target?: { id: string; name: string; type: string },
  metadata?: Record<string, string>
): Promise<void> {
  const client = getRetracedClient();
  if (!client) return;

  try {
    const event: Event = {
      action,
      crud: deriveCrud(action),
      group: { id: teamId, name: teamName },
      actor: { id: userId, name: userName },
      created: new Date(),
      ...(target ? { target } : {}),
      ...(metadata ? { fields: metadata } : {}),
    };
    await client.reportEvent(event);
  } catch {
    // Audit logging is non-critical — don't let failures break the main flow
  }
}
