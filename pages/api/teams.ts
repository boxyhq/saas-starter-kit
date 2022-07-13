import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/session";
import { createTeam, getTeamBySlug } from "models/teams";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, slug } = req.body;

  const session = await getSession(req, res);

  if (await getTeamBySlug(slug)) {
    return res.status(409).json({
      data: null,
      error: {
        message: "There is an error when creating team",
        values: { slug: "Team slug is already taken." },
      },
    });
  }

  const team = await createTeam(name, slug, session?.user.id);

  return res.status(200).json({ data: team, error: null });
};
