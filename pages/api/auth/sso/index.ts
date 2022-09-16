import type { NextApiRequest, NextApiResponse } from "next";

import type { OAuthReqBody } from "@boxyhq/saml-jackson";
import jackson from "@/lib/jackson";
import env from "@/lib/env";
import { prisma } from "@/lib/prisma";

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
  const { slug } = req.body;

  const { apiController, oauthController } = await jackson();

  const team = await prisma.team.findUnique({
    where: { slug },
  });

  if (!team) {
    return res.status(404).json({
      data: null,
      error: {
        values: {
          slug: "The team does not exist in the database.",
        },
      },
    });
  }

  const samlConfig = await apiController.getConfig({
    tenant: team.id,
    product: env.product,
  });

  // Check if the SAML config exists for the team
  if (Object.keys(samlConfig).length === 0) {
    return res.status(404).json({
      data: null,
      error: {
        values: {
          slug: "SAML SSO is not configured for this team.",
        },
      },
    });
  }

  const params = {
    tenant: team.id,
    product: env.product,
    redirect_uri: env.saml.callback,
    state: "some-random-state",
  } as OAuthReqBody;

  const response = await oauthController.authorize(params);

  return res.status(200).json({ data: response, error: null });
};
