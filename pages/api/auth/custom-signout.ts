import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  getAuthOptions,
  sessionTokenCookieName,
  sessionTokenCookieOptions,
} from '@/lib/nextAuth';
import { prisma } from '@/lib/prisma';
import { getCookie, setCookie } from 'cookies-next';
import env from '@/lib/env';
import { deleteSession } from 'models/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authOptions = getAuthOptions(req, res);
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (env.nextAuth.sessionStrategy === 'database') {
      const sessionToken = await getCookie(sessionTokenCookieName, {
        req,
        res,
      });
      const sessionDBEntry = await prisma.session.findFirst({
        where: {
          sessionToken: sessionToken,
        },
      });

      if (sessionDBEntry) {
        await deleteSession({
          where: {
            sessionToken: sessionToken,
          },
        });
      }
    }

    setCookie(sessionTokenCookieName, '', {
      req,
      res,
      ...sessionTokenCookieOptions,
      expires: new Date(0),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return res.status(500).json({ error: 'Failed to sign out' });
  }
}
