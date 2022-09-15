import type { NextApiRequest, NextApiResponse } from "next";

import { getInvitation } from "models/invitation";

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

// Get the invitation by token
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query;

  const invitation = await getInvitation({ token: token as string });

  return res.status(200).json({ data: invitation, error: null });
};
