import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";

import type { OAuthTokenReq } from "@boxyhq/saml-jackson";
import { prisma } from "@/lib/prisma";
import env from "@/lib/env";
import jackson from "@/lib/jackson";
import { createUser, getUser } from "models/user";
import { addTeamMember, getTeam } from "models/team";

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
          redirect_uri: env.saml.callback,
        } as OAuthTokenReq;

        const { access_token } = await oauthController.token(params);
        const profile = await oauthController.userInfo(access_token);

        let user = await getUser({ email: profile.email });

        if (user === null) {
          // Create user account if it doesn't exist
          user = await createUser({
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
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

      return (await getUser({ email: user.email })) ? true : false;
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
