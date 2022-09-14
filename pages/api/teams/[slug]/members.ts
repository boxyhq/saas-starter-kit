import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import { getTeam, isTeamMember, getTeamMembers } from "models/team";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get members of a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!isTeamMember(userId, team?.id)) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const members = await getTeamMembers(slug as string);

  return res.status(200).json({ data: members, error: null });
};
