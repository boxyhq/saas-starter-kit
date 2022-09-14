import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import { createTeam, getTeams } from "models/teams";
import { getTenant, isTenantMember } from "models/tenants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePOST(req, res);
    case "GET":
      return handleGET(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Create a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tenant = await getTenant({ slug: slug as string });

  if (!isTenantMember(userId, tenant.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const team = await createTeam({ name, tenantId: tenant.id });

  return res.status(200).json({ data: team, error: null });
};

// Get all teams
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tenant = await getTenant({ slug: slug as string });

  if (!isTenantMember(userId, tenant.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  // TODO: Fetch teams with member
  const teamList = await getTeams(tenant.id);

  return res.status(200).json({ data: teamList, error: null });
};
