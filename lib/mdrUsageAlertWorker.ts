/**
 * MDR Usage Alert Worker
 *
 * Run with: ts-node --transpile-only lib/mdrUsageAlertWorker.ts
 *
 * Scheduled daily via BullMQ repeatable job (09:00 UTC).
 * For each active team with MDR projects, checks whether MDR project usage
 * is >= 80% of their plan quota. If so, and if no alert was sent in the last
 * 7 days, sends a warning email to all team OWNER/ADMIN members.
 */
import { Worker, Queue } from 'bullmq';
import { Role } from '@prisma/client';
import { prisma } from './prisma';
import { redisConnection, usageAlertQueue } from './mdrQueue';
import { sendEmail } from './email/sendEmail';
import env from './env';
import app from './app';

/**
 * Inline quota resolver — mirrors lib/mdr.ts getMdrQuota() but uses only
 * relative imports so it's safe to run under ts-node --transpile-only
 * (which cannot resolve @/ path aliases at runtime).
 */
async function getTeamMdrQuota(teamId: string): Promise<number> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { mdrQuotaOverride: true, billingId: true },
  });
  if (!team) return env.mdr.defaultLimit;
  if (team.mdrQuotaOverride !== null && team.mdrQuotaOverride !== undefined) {
    return team.mdrQuotaOverride;
  }
  if (team.billingId) {
    const sub = await prisma.subscription.findFirst({
      where: { customerId: team.billingId, active: true },
      select: { priceId: true },
    });
    if (sub?.priceId) {
      const planLimit = env.mdr.planLimits[sub.priceId];
      if (planLimit !== undefined) return planLimit;
    }
  }
  return env.mdr.defaultLimit;
}

const ALERT_THRESHOLD = 0.8;
const ALERT_COOLDOWN_DAYS = 7;

async function checkTeamUsage(teamId: string): Promise<void> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      slug: true,
      suspended: true,
      lastQuotaAlertAt: true,
    },
  });

  if (!team || team.suspended) return;

  // Check cooldown — skip if alert was sent within the last 7 days
  if (team.lastQuotaAlertAt) {
    const daysSinceAlert =
      (Date.now() - new Date(team.lastQuotaAlertAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceAlert < ALERT_COOLDOWN_DAYS) return;
  }

  const quota = await getTeamMdrQuota(teamId);
  if (quota === -1) return; // unlimited — no alert needed

  const activeCount = await prisma.mdrProject.count({
    where: { teamId, status: { not: 'FINAL' } },
  });

  const usage = quota > 0 ? activeCount / quota : 0;
  if (usage < ALERT_THRESHOLD) return;

  // Fetch team OWNER and ADMIN email addresses
  const owners = await prisma.teamMember.findMany({
    where: { teamId, role: { in: [Role.OWNER, Role.ADMIN] } },
    include: { user: { select: { email: true, name: true } } },
  });

  if (owners.length === 0) return;

  const pct = Math.round(usage * 100);

  await Promise.allSettled(
    owners.map(({ user }) =>
      sendEmail({
        to: user.email,
        subject: `[${app.name}] MDR project limit warning — ${team.name} is at ${pct}%`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #b45309;">MDR Project Limit Warning</h2>
  <p>Hi ${user.name || 'there'},</p>
  <p>
    Your team <strong>${team.name}</strong> has used <strong>${activeCount} of ${quota}</strong>
    MDR project slots (<strong>${pct}%</strong>).
  </p>
  <p>
    Once you reach your limit you will not be able to create new MDR projects until
    you archive existing ones or upgrade your plan.
  </p>
  <p style="margin: 30px 0;">
    <a href="${process.env.APP_URL || ''}/teams/${team.slug}/billing"
       style="background: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      View Billing &amp; Upgrade
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #999;">
    You are receiving this because you are an Owner or Admin of ${team.name} on ${app.name}.
    Alerts are sent at most once every ${ALERT_COOLDOWN_DAYS} days.
  </p>
</body>
</html>
        `.trim(),
      })
    )
  );

  // Update last alert timestamp
  await prisma.team.update({
    where: { id: teamId },
    data: { lastQuotaAlertAt: new Date() },
  });

  console.log(
    `[usage-alert] Sent quota warning to ${owners.length} admin(s) for team ${team.name} (${pct}% used)`
  );
}

async function runUsageChecks(): Promise<void> {
  const teams = await prisma.team.findMany({
    where: { suspended: false },
    select: { id: true },
  });

  console.log(`[usage-alert] Checking usage for ${teams.length} team(s)…`);

  for (const { id } of teams) {
    try {
      await checkTeamUsage(id);
    } catch (err) {
      console.error(`[usage-alert] Error checking team ${id}:`, err);
    }
  }

  console.log('[usage-alert] Usage check complete');
}

// Register the daily repeatable job (runs at 09:00 UTC)
async function scheduleJob() {
  await usageAlertQueue.add(
    'daily-check',
    {},
    {
      repeat: { pattern: '0 9 * * *' },
      removeOnComplete: { count: 5 },
      removeOnFail: { count: 10 },
    }
  );
  console.log('[usage-alert] Daily cron job scheduled (09:00 UTC)');
}

const worker = new Worker(
  'mdr-usage-alerts',
  async (_job) => {
    await runUsageChecks();
  },
  {
    connection: redisConnection,
    concurrency: 1,
  }
);

worker.on('failed', (job, error) => {
  console.error(`[usage-alert] Job ${job?.id} failed:`, error);
});

worker.on('completed', (job) => {
  console.log(`[usage-alert] Job ${job.id} completed`);
});

scheduleJob().catch(console.error);

console.log('MDR usage alert worker started');
