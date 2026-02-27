import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface LogOptions {
  mdrId: string;
  userId?: string | null;
  action: string;
  details?: Record<string, unknown>;
}

/**
 * Write an activity entry for an MDR project.
 * Fire-and-forget: errors are swallowed so they never break the caller.
 */
export async function logMdrActivity(opts: LogOptions): Promise<void> {
  try {
    await prisma.mdrActivityLog.create({
      data: {
        mdrId: opts.mdrId,
        userId: opts.userId ?? null,
        action: opts.action,
        details: (opts.details ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Non-blocking — logging failures must not propagate
  }
}
