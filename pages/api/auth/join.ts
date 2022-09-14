import type { NextApiRequest, NextApiResponse } from "next";

import { createUser, getUser } from "models/user";
import { getTeam, createTeam } from "models/team";
import { slugify } from "@/lib/common";

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

// Signup the user
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, tenant, inviteToken } = JSON.parse(req.body);

  // const invitation = inviteToken
  //   ? await invitations.getInvitation(inviteToken)
  //   : null;

  // if (inviteToken && !invitation) {
  //   return res
  //     .status(404)
  //     .json({ data: null, error: { message: "Invitation not found." } });
  // }

  const existingUser = await getUser({ email });

  if (existingUser) {
    return res.status(400).json({
      data: null,
      error: {
        message:
          "An user with this email already exists or the email was invalid.",
      },
    });
  }

  const existingTeam = await getTeam({ slug: tenant });

  if (existingTeam) {
    return res.status(400).json({
      data: null,
      error: {
        message: "A team with this name already exists in our database.",
      },
    });
  }

  const user = await createUser({ name, email });

  await createTeam({
    ownerId: user.id,
    name: tenant,
    slug: slugify(tenant),
  });

  return res.status(200).json({ data: user, error: null });
};
