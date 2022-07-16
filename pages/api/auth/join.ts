import type { NextApiRequest, NextApiResponse } from "next";

import users from "models/users";
import invitations from "models/invitations";

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
  const { name, email, tenant, inviteToken } = req.body;

  const invitation = inviteToken
    ? await invitations.getInvitation(inviteToken)
    : null;

  if (inviteToken && !invitation) {
    return res
      .status(404)
      .json({ data: null, error: { message: "Invitation not found." } });
  }

  const existingUser = await users.getUser({ email });

  if (existingUser) {
    return res.status(400).json({
      data: null,
      error: {
        message:
          "A user with this email already exists or the email was invalid.",
      },
    });
  }

  const user = invitation
    ? await users.createUser({
        name,
        email,
        tenantId: invitation.tenantId,
      })
    : await users.createUserAndTenant({
        name,
        email,
        tenant,
      });

  return res.status(200).json({ data: user, error: null });
};
