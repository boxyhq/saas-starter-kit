import type { NextApiRequest, NextApiResponse } from "next";

import jackson from "@lib/jackson";
import env from "@lib/env";

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
  const { encodedRawMetadata, teamName } = req.body;

  const { apiController } = await jackson();

  try {
    const samlConfig = await apiController.config({
      encodedRawMetadata,
      defaultRedirectUrl: env.acsUrl,
      redirectUrl: env.acsUrl,
      tenant: teamName,
      product: env.product,
      name: teamName,
      description: "",
    });

    return res.status(200).json({ data: samlConfig, error: null });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({
      data: null,
      error: {
        message: "Failed to configure SAML",
        values: {
          metadata: message,
        },
      },
    });
  }
};
