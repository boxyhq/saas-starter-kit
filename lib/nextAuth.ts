import type {
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
} from 'next';
import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import BoxyHQSAMLProvider from 'next-auth/providers/boxyhq-saml';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { Provider } from 'next-auth/providers';
import { setCookie, getCookie } from 'cookies-next';
import { encode, decode } from 'next-auth/jwt';
import { randomUUID } from 'crypto';

import { Role } from '@prisma/client';
import { getAccount } from 'models/account';
import { addTeamMember, getTeam } from 'models/team';
import { createUser, getUser } from 'models/user';
import { verifyPassword } from '@/lib/auth';
import { isBusinessEmail } from '@/lib/email/utils';
import env from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { isAuthProviderEnabled } from '@/lib/auth';
import { validateRecaptcha } from '@/lib/recaptcha';
import { sendMagicLink } from '@/lib/email/sendMagicLink';
import {
  clearLoginAttempts,
  exceededLoginAttemptsThreshold,
  incrementLoginAttempts,
} from '@/lib/accountLock';
import { slackNotify } from './slack';

const adapter = PrismaAdapter(prisma);
const providers: Provider[] = [];
const sessionMaxAge = 30 * 24 * 60 * 60; // 30 days
const useSecureCookie = env.appUrl.startsWith('https://');

export const sessionTokenCookieName =
  (useSecureCookie ? '__Secure-' : '') + 'next-auth.session-token';

if (isAuthProviderEnabled('credentials')) {
  providers.push(
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
        recaptchaToken: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('no-credentials');
        }

        const { email, password, recaptchaToken } = credentials;

        await validateRecaptcha(recaptchaToken);

        if (!email || !password) {
          return null;
        }

        const user = await getUser({ email });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (exceededLoginAttemptsThreshold(user)) {
          throw new Error('exceeded-login-attempts');
        }

        if (env.confirmEmail && !user.emailVerified) {
          throw new Error('confirm-your-email');
        }

        const hasValidPassword = await verifyPassword(
          password,
          user?.password as string
        );

        if (!hasValidPassword) {
          if (
            exceededLoginAttemptsThreshold(await incrementLoginAttempts(user))
          ) {
            throw new Error('exceeded-login-attempts');
          }

          throw new Error('invalid-credentials');
        }

        await clearLoginAttempts(user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    })
  );
}

if (isAuthProviderEnabled('github')) {
  providers.push(
    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('google')) {
  providers.push(
    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (isAuthProviderEnabled('saml')) {
  providers.push(
    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: env.jackson.selfHosted ? env.jackson.url : env.appUrl,
      clientId: 'dummy',
      clientSecret: 'dummy',
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000,
      },
    })
  );
}

if (isAuthProviderEnabled('email')) {
  providers.push(
    EmailProvider({
      server: {
        host: env.smtp.host,
        port: env.smtp.port,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.password,
        },
      },
      from: env.smtp.from,
      maxAge: 1 * 60 * 60, // 1 hour
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLink(identifier, url);
      },
    })
  );
}

export const getAuthOptions = (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
) => {
  const isCredentialsProviderCallback =
    (req as NextApiRequest).query &&
    (req as NextApiRequest).query.nextauth?.includes('callback') &&
    (req as NextApiRequest).query.nextauth?.includes('credentials') &&
    req.method === 'POST' &&
    env.nextAuth.sessionStrategy === 'database';

  const authOptions: NextAuthOptions = {
    adapter,
    providers,
    pages: {
      signIn: '/auth/login',
      verifyRequest: '/auth/verify-request',
    },
    session: {
      strategy: env.nextAuth.sessionStrategy,
      maxAge: sessionMaxAge,
    },
    secret: env.nextAuth.secret,
    callbacks: {
      async signIn({ user, account, profile }) {
        if (!user || !user.email || !account) {
          return false;
        }

        if (env.disableNonBusinessEmailSignup && !isBusinessEmail(user.email)) {
          return '/auth/login?error=allow-only-work-email';
        }

        // Handle credentials provider
        if (isCredentialsProviderCallback) {
          const sessionToken = randomUUID();
          const expires = new Date(Date.now() + sessionMaxAge * 1000);

          if (adapter.createSession) {
            await adapter.createSession({
              sessionToken,
              userId: user.id,
              expires,
            });
          }

          setCookie(sessionTokenCookieName, sessionToken, {
            req,
            res,
            expires,
            secure: useSecureCookie,
          });
        }

        if (account?.provider === 'credentials') {
          return true;
        }

        const existingUser = await getUser({ email: user.email });

        // Login via email (Magic Link)
        if (account?.provider === 'email') {
          return existingUser ? true : false;
        }

        // First time users
        if (!existingUser) {
          const newUser = await createUser({
            name: `${user.name}`,
            email: `${user.email}`,
          });

          await linkAccount(newUser, account);

          if (account.provider === 'boxyhq-saml' && profile) {
            await linkToTeam(profile, newUser.id);
          }

          slackNotify()?.alert({
            text: 'New user signed up',
            fields: {
              Name: user.name || '',
              Email: user.email,
            },
          });

          return true;
        }

        // Existing users reach here
        const linkedAccount = await getAccount({ userId: existingUser.id });

        if (!linkedAccount) {
          await linkAccount(existingUser, account);
        }

        return true;
      },

      async session({ session, token, user }) {
        // When using JWT for sessions, the JWT payload (token) is provided.
        // When using database sessions, the User (user) object is provided.
        if (session && (token || user)) {
          session.user.id = token?.sub || user?.id;
        }

        return session;
      },

      async jwt({ token, trigger, session }) {
        if (trigger === 'update' && 'name' in session && session.name) {
          return { ...token, name: session.name };
        }

        return token;
      },
    },
    jwt: {
      encode: async (params) => {
        if (isCredentialsProviderCallback) {
          return getCookie(sessionTokenCookieName, { req, res }) || '';
        }

        return encode(params);
      },

      decode: async (params) => {
        if (isCredentialsProviderCallback) {
          return null;
        }

        return decode(params);
      },
    },
  };

  return authOptions;
};

const linkAccount = async (user: User, account: Account) => {
  if (adapter.linkAccount) {
    return await adapter.linkAccount({
      providerAccountId: account.providerAccountId,
      userId: user.id,
      provider: account.provider,
      type: 'oauth',
      scope: account.scope,
      token_type: account.token_type,
      access_token: account.access_token,
    });
  }
};

const linkToTeam = async (profile: Profile, userId: string) => {
  const team = await getTeam({
    id: profile.requested.tenant,
  });

  // Sort out roles
  const roles = profile.roles || profile.groups || [];
  let userRole: Role = team.defaultRole || Role.MEMBER;

  for (let role of roles) {
    if (env.groupPrefix) {
      role = role.replace(env.groupPrefix, '');
    }

    // Owner > Admin > Member
    if (
      role.toUpperCase() === Role.ADMIN &&
      userRole.toUpperCase() !== Role.OWNER.toUpperCase()
    ) {
      userRole = Role.ADMIN;
      continue;
    }

    if (role.toUpperCase() === Role.OWNER) {
      userRole = Role.OWNER;
      break;
    }
  }

  await addTeamMember(team.id, userId, userRole);
};
