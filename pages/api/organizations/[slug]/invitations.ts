import type { NextApiRequest, NextApiResponse } from "next";

import invitations from "models/invitations";
import tenants from "models/tenants";
import { getSession } from "@lib/session";
import users from "models/users";

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
  const { email, role } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);

  const tenant = await tenants.getTenantBySlug(slug as string);
  const user = await users.getUserBySession(session);

  if (!tenant || !user) {
    return res.status(404).json({
      data: null,
      error: { message: "Tenant or user not found" },
    });
  }

  const invitation = await invitations.createInvitation({
    tenant,
    user,
    email,
    role,
  });

  return res.status(200).json({ data: invitation, error: null });
};
