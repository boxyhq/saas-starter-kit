import type { NextApiRequest, NextApiResponse } from "next";

import env from "@/lib/env";
import jackson from "@/lib/jackson";
import { getSession } from "@/lib/session";
import { getTeam, isTeamMember } from "models/team";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const { directorySync } = await jackson();

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    team.id,
    env.product
  );

  return res.status(200).json({ data, error });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, provider } = req.body;
  const { slug } = req.query;

  const { directorySync } = await jackson();

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const { data, error } = await directorySync.directories.create({
    name,
    type: provider,
    tenant: team.id,
    product: env.product,
  });

  return res.status(201).json({ data, error });
};
