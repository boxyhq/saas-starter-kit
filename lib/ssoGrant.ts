import { createHash } from 'crypto';
import type { Profile } from '@boxyhq/saml-jackson';
import type { Session } from '@ory/client-fetch';
import { prisma } from './prisma';
import { oryIdentity } from './ory';
import env from './env';
import { ssoManager } from './jackson/sso';

const grantKey = (subject: string) =>
  `sso-grant:${createHash('sha256').update(subject).digest('hex')}`;

// Called only after Jackson has redeemed an authorization code and returned
// the verified profile. Browser tenant hints are never authorization evidence.
export async function recordSSOGrant(profile: Profile) {
  if (
    !env.teamFeatures.sso ||
    !profile.sub ||
    !profile.email ||
    !profile.requested?.tenant ||
    profile.requested.product !== env.jackson.productId
  ) {
    return;
  }
  const identifier = JSON.stringify({
    teamId: profile.requested.tenant,
    email: profile.email,
    issuedAt: Date.now(),
  });
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationToken.upsert({
    where: { token: grantKey(profile.sub) },
    create: { token: grantKey(profile.sub), identifier, expires },
    update: { identifier, expires },
  });
}

export async function getSSOGrant(session: Session) {
  const authentication = session.authentication_methods?.find(
    (method) => method.method === 'oidc' && method.provider === 'sso'
  );
  if (!authentication?.completed_at || !session.identity) return null;

  const identity = await oryIdentity.getIdentity({
    id: session.identity.id,
    includeCredential: ['oidc'],
  });
  const config = identity.credentials?.oidc?.config as
    | { providers?: { provider: string; subject: string }[] }
    | undefined;
  for (const provider of config?.providers ?? []) {
    if (provider.provider !== 'sso' || !provider.subject) continue;
    const grant = await prisma.verificationToken.findUnique({
      where: { token: grantKey(provider.subject) },
    });
    if (
      !grant ||
      grant.expires <= new Date() ||
      grant.identifier === 'consumed'
    ) {
      continue;
    }
    const data = JSON.parse(grant.identifier) as {
      teamId: string;
      email: string;
      issuedAt: number;
    };
    // Only the Ory login that just redeemed this subject may consume the grant.
    const completedAt = new Date(authentication.completed_at).getTime();
    if (
      !Number.isFinite(completedAt) ||
      Math.abs(completedAt - data.issuedAt) > 60_000 ||
      data.email !== session.identity.traits?.email
    ) {
      continue;
    }
    const connections = await ssoManager().getConnections({
      tenant: data.teamId,
      product: env.jackson.productId,
    });
    if (!connections.some((connection) => !connection.deactivated)) continue;
    const team = await prisma.team.findUnique({ where: { id: data.teamId } });
    if (team) return { ...grant, team };
  }
  return null;
}

export async function applySSOGrant(
  userId: string,
  grant: NonNullable<Awaited<ReturnType<typeof getSSOGrant>>>
) {
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.verificationToken.updateMany({
      where: {
        token: grant.token,
        identifier: grant.identifier,
        expires: { gt: new Date() },
      },
      data: { identifier: 'consumed' },
    });
    if (consumed.count !== 1) return;
    await tx.teamMember.upsert({
      where: { teamId_userId: { teamId: grant.team.id, userId } },
      create: { teamId: grant.team.id, userId, role: grant.team.defaultRole },
      update: {},
    });
  });
}
