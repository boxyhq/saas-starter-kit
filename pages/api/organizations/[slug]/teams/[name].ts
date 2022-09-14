import type { NextApiRequest, NextApiResponse } from "next";

import { slugify } from "@/lib/common";
import { getSession } from "@/lib/session";
import { getTenant, isTenantMember } from "models/tenants";
import { getTeam, isTeamMember, updateTeam } from "models/teams";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get a team by name
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, name } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tenant = await getTenant({ slug: slug as string });

  if (!isTenantMember(userId, tenant.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const team = await getTeam({ name: name as string });

  if (!isTeamMember(userId, team.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  return res.status(200).json({ data: team, error: null });
};

// Update a team
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name: newName } = req.body;
  const { slug, name } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const tenant = await getTenant({ slug: slug as string });

  if (!isTenantMember(userId, tenant.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const team = await getTeam({ name: name as string });

  if (!isTeamMember(userId, team.id)) {
    return res.status(403).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const updatedTeam = await updateTeam(team.id, {
    name: slugify(newName),
  });

  return res.status(200).json({ data: updatedTeam, error: null });
};
