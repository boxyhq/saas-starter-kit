import { verifyPassword } from '@/lib/auth';
import env from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Role } from '@prisma/client';
import { getAccount } from 'models/account';
import { addTeamMember, getTeam, getTeamRoles } from 'models/team';
import { createUser, getUser } from 'models/user';
import NextAuth, { Account, NextAuthOptions, User } from 'next-auth';
import BoxyHQSAMLProvider from 'next-auth/providers/boxyhq-saml';
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
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('no-credentials');
        }

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const user = await getUser({ email });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (env.confirmEmail && !user.emailVerified) {
          throw new Error('email-not-verified');
        }

        const hasValidPassword = await verifyPassword(
          password,
          user?.password as string
        );

        if (!hasValidPassword) {
          throw new Error('invalid-credentials');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),

    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: env.appUrl,
      clientId: 'dummy',
      clientSecret: 'dummy',
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000,
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
        account?.provider === 'credentials' ||
        account?.provider === 'github' ||
        account?.provider === 'google'
      ) {
        return true;
      }

      if (!user.email) {
        return false;
      }

      // Login via email (Magic Link)
      if (account?.provider === 'email') {
        const userFound = await getUser({ email: user.email });

        if (!userFound) {
          return false;
        }

        return true;
      }

      if (!account || !profile) {
        return false;
      }

      // TODO: Only SAML login reaches here for now

      // TODO: We should check if email is verified here before linking account
      const existingUser = await getUser({ email: user.email });

      // Create user account if it doesn't exist
      if (!existingUser) {
        const newUser = await createUser({
          name: `${user.name}`,
          email: `${user.email}`,
        });

        await linkAccount(newUser, account);

        await linkToTeam(profile, newUser.id);
      } else {
        const linkedAccount = await getAccount({ userId: existingUser.id });

        if (!linkedAccount) {
          await linkAccount(existingUser, account);
        }

        await linkToTeam(profile, existingUser.id);
      }

      return true;
    },

    async session({ session, token }) {
      if (token && session) {
        session.user.id = token.sub as string;

        if (token.sub) {
          const roles = await getTeamRoles(token.sub as string);
          (session.user as any).roles = roles;
        }
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

const linkToTeam = async (profile: any, userId: string) => {
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
