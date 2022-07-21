import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import tenants from "models/tenants";

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

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const organizations = await tenants.getTenants(session?.user.id as string);

  return res.status(200).json({ data: organizations, error: null });
};
