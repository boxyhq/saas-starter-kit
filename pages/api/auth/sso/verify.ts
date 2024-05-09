import env from '@/lib/env';
import { ssoManager } from '@/lib/jackson/sso';
import { ssoVerifySchema, validateWithSchema } from '@/lib/zod';
import { getTeam, getTeams } from 'models/team';
import { getUser } from 'models/user';
import { NextApiRequest, NextApiResponse } from 'next';

const sso = ssoManager();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (err: any) {
    res.status(400).json({
      error: { message: err.message },
    });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, email } = validateWithSchema(
    ssoVerifySchema,
    JSON.parse(req.body) as { slug: string }
  );

  if (slug) {
    const team = await getTeam({ slug });

    if (!team) {
      throw new Error('Team not found.');
    }

    const connections = await sso.getConnections({
      tenant: team.id,
      product: env.jackson.productId,
    });

    if (!connections || connections.length === 0) {
      throw new Error('No SSO connections found for this team.');
    }

    const data = {
      teamId: team.id,
    };

    res.json({ data });
  } else if (email) {
    const user = await getUser({ email });
    if (!user) {
      throw new Error('User not found.');
    }
    const teams = await getTeams(user.id);
    if (!teams.length) {
      throw new Error('User does not belong to any team.');
    }
    if (teams.length === 1) {
      const team = teams[0];
      const connections = await sso.getConnections({
        tenant: team.id,
        product: env.jackson.productId,
      });

      if (!connections || connections.length === 0) {
        throw new Error('No SSO connections found for the team.');
      }

      const data = {
        teamId: team.id,
      };

      res.json({ data });
    } else {
      const teamsWithConnections: any[] = [];
      for (const team of teams) {
        const connections = await sso.getConnections({
          tenant: team.id,
          product: env.jackson.productId,
        });

        if (connections && connections.length > 0) {
          teamsWithConnections.push({
            teamId: team.id,
          });
        }
      }
      if (!teamsWithConnections.length) {
        throw new Error('No SSO connections found for any team.');
      } else if (teamsWithConnections.length === 1) {
        res.json({ data: teamsWithConnections[0] });
      } else {
        res.json({
          data: {
            useSlug: true,
          },
        });
      }
    }
  } else {
    throw new Error('Invalid request.');
  }
};
