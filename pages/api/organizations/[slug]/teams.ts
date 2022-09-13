import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import teams from "models/teams";
import tenants from "models/tenants";
import users from "models/users";
import { slugify } from "@/lib/common";

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
    case "PUT":
      return handlePUT(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
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

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, name } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);
  const user = await users.getUserBySession(session);

  if (!user) {
    return res.status(404).json({
      data: null,
      error: { message: "User not found" },
    });
  }

  const tenant = await tenants.getTenant({ slug: slug as string });
  const team = await teams.getTeam({ id });

  if (team.tenantId !== tenant?.id) {
    return res.status(404).json({
      data: null,
      error: { message: "User are not allowed to do this operation." },
    });
  }

  const updateTeam = await teams.updateTeam(team.id, {
    name: slugify(name),
  });

  return res.status(200).json({ data: updateTeam, error: null });
};
