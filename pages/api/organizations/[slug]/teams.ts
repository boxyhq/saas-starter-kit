import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import teams from "models/teams";
import tenants from "models/tenants";
import users from "models/users";

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
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);

  const tenant = await tenants.getTenant({ slug: slug as string });
  const user = await users.getUserBySession(session);

  if (!tenant || !user) {
    return res.status(404).json({
      data: null,
      error: { message: "Tenant or user not found" },
    });
  }

  const team = await teams.createTeam({ name, tenantId: tenant.id });

  return res.status(200).json({ data: team, error: null });
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);

  const tenant = await tenants.getTenant({ slug: slug as string });
  const user = await users.getUserBySession(session);

  if (!tenant || !user) {
    return res.status(404).json({
      data: null,
      error: { message: "Tenant or user not found" },
    });
  }

  const teamList = await teams.getTeams(tenant.id);

  return res.status(200).json({ data: teamList, error: null });
};
