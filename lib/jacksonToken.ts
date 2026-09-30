import { createHash } from 'crypto';
import jackson from './jackson';
import { prisma } from './prisma';
import { ApiError } from './errors';

// Jackson's backing code store must never be reusable through either endpoint.
export async function redeemJacksonCode(
  body: Parameters<
    Awaited<ReturnType<typeof jackson>>['oauthController']['token']
  >[0],
  authorization?: string
) {
  if (
    typeof body.code !== 'string' ||
    !/^[a-fA-F0-9]{64}\.[a-f0-9]{40}$/.test(body.code)
  ) {
    throw new ApiError(400, 'Invalid authorization code.');
  }
  // The store ID is canonical; hex decryption keys have equivalent encodings.
  const token = `sso-code:${createHash('sha256').update(body.code.split('.')[1]).digest('hex')}`;
  await prisma.verificationToken.deleteMany({
    where: { token: { startsWith: 'sso-code:' }, expires: { lt: new Date() } },
  });
  try {
    await prisma.verificationToken.create({
      data: {
        token,
        identifier: 'redeemed',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') throw new ApiError(400, 'Code already used.');
    throw error;
  }
  try {
    const { oauthController } = await jackson();
    // The installed controller accepts Basic auth at runtime, but its public
    // interface takes body credentials. Normalize either client auth form here.
    if (
      authorization?.startsWith('Basic ') &&
      !body.client_id &&
      !body.code_verifier
    ) {
      const credentials = Buffer.from(
        authorization.slice(6),
        'base64'
      ).toString('utf8');
      const separator = credentials.indexOf(':');
      if (separator < 0)
        throw new ApiError(400, 'Invalid client authentication.');
      body = {
        code: body.code,
        redirect_uri: body.redirect_uri,
        grant_type: body.grant_type,
        client_id: decodeURIComponent(credentials.slice(0, separator)),
        client_secret: decodeURIComponent(credentials.slice(separator + 1)),
      };
    }
    return await oauthController.token(body);
  } catch (error) {
    // Invalid codes must not leave permanent records in this public endpoint.
    await prisma.verificationToken.deleteMany({ where: { token } });
    throw error;
  }
}
