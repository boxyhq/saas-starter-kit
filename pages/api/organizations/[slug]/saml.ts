import type { NextApiRequest, NextApiResponse } from "next";

import jackson from "@lib/jackson";
import env from "@lib/env";
import tenants from "models/tenants";

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
  const { encodedRawMetadata } = req.body;
  const { slug } = req.query;

  const { apiController } = await jackson();

  const organization = await tenants.getTenant({ slug: slug as string });

  if (!organization) {
    return res.status(404).json({
      data: null,
      error: { message: `Organization ${slug} not found` },
    });
  }

  try {
    const samlConfig = await apiController.config({
      encodedRawMetadata,
      defaultRedirectUrl: env.saml.callback,
      redirectUrl: env.saml.callback,
      tenant: organization.id,
      product: env.product,
      name: organization.name,
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
