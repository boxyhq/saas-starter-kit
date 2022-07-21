import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import type { OAuthTokenReq } from "@boxyhq/saml-jackson";
import { prisma } from "@/lib/prisma";
import env from "@/lib/env";
import jackson from "@/lib/jackson";
import users from "models/users";
import tenants from "models/tenants";
import { Role } from "types";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "saml-sso",
      credentials: {
        code: { type: "text" },
        state: { type: "state" },
      },
      async authorize(credentials) {
        const code = credentials?.code;
        // const state = credentials?.state;

        const { oauthController } = await jackson();

        const params = {
          client_id: "dummy",
          client_secret: "dummy",
          code,
        } as OAuthTokenReq;

        const { access_token } = await oauthController.token(params);
        const profile = await oauthController.userInfo(access_token);

        let user = await users.getUser({ email: profile.email });

        if (user === null) {
          // Create user account if it doesn't exist

          user = await users.createUser({
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            tenantId: profile.requested.tenant,
          });

          const tenant = await tenants.getTenant({
            id: profile.requested.tenant,
          });

          await tenants.addUser({
            userId: user.id,
            tenantId: tenant?.id as string,
            role: tenant?.defaultRole as Role,
          });
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
  ],
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  secret: env.nextAuth.secret,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      return (await users.getUser({ email: user.email })) ? true : false;
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
