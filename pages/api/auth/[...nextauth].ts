import { hashPassword, verifyPassword } from '@/lib/auth';
import { createRandomString } from '@/lib/common';
import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { prisma } from '@/lib/prisma';
import type { OAuthTokenReq } from '@boxyhq/saml-jackson';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getAccount } from 'models/account';
import { addTeamMember, getTeam } from 'models/team';
import { createUser, getUser } from 'models/user';
import NextAuth, { Account, NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const adapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error('No credentials found.');
        }

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const user = await getUser({ email });

        if (!user) {
          return null;
        }

        const hasValidPassword = await verifyPassword(password, user.password);

        if (!hasValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),

    CredentialsProvider({
      id: 'saml-sso',
      credentials: {
        code: { type: 'text' },
        state: { type: 'text' },
      },
      async authorize(credentials) {
        const code = credentials?.code;

        if (!code) {
          throw new Error('No code found.');
        }

        const { oauthController } = await jackson();

        const { access_token } = await oauthController.token({
          client_id: 'dummy',
          client_secret: 'dummy',
          code,
          redirect_uri: env.saml.callback,
        } as OAuthTokenReq);

        const profile = await oauthController.userInfo(access_token);
        let user = await getUser({ email: profile.email });

        if (user === null) {
          // Create user account if it doesn't exist
          user = await createUser({
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            password: await hashPassword(createRandomString()),
          });

          const team = await getTeam({
            id: profile.requested.tenant,
          });

          await addTeamMember(team.id, user.id, team.defaultRole);
        }

        return user;
      },
    }),

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
    }),

    GitHubProvider({
      clientId: env.github.clientId,
      clientSecret: env.github.clientSecret,
    }),

    GoogleProvider({
      clientId: env.google.clientId,
      clientSecret: env.google.clientSecret,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
  secret: env.nextAuth.secret,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account.provider === 'email' ||
        account.provider === 'credentials' ||
        account.provider === 'saml-sso'
      ) {
        return true;
      }

      if (account.provider != 'github' && account.provider != 'google') {
        return false;
      }

      if (!user.email) {
        return false;
      }

      if (!user.email) {
        return false;
      }

      // TODO: We should check if email is verified here before linking account

      const existingUser = await getUser({ email: user.email });

      if (!existingUser) {
        // Create user account if it doesn't exist
        const newUser = await createUser({
          name: `${profile.name}`,
          email: `${profile.email}`,
        });

        await linkAccount(newUser, account);
      } else {
        // User account already exists, check if it's linked to the account
        const linkedAccount = await getAccount({ userId: existingUser.id });

        if (linkedAccount) {
          return true;
        }

        await linkAccount(existingUser, account);
      }

      return true;
    },

    async session({ session, token }) {
      if (token && session) {
        session.user.id = token.sub as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

const linkAccount = async (user: User, account: Account) => {
  return await adapter.linkAccount({
    providerAccountId: account.providerAccountId,
    userId: user.id,
    provider: account.provider,
    type: 'oauth',
    scope: account.scope,
    token_type: account.token_type,
    access_token: account.access_token,
  });
};
