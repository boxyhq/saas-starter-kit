import type { NextApiRequest, NextApiResponse } from "next";

import env from "@/lib/env";
import jackson from "@/lib/jackson";
import { getSession } from "@/lib/session";
import { getTeam, isTeamMember } from "models/team";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const { apiController } = await jackson();

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  try {
    const samlConfig = await apiController.getConfig({
      tenant: team.id,
      product: env.product,
    });

    const config = {
      config: samlConfig,
      issuer: env.saml.issuer,
      acs: env.saml.acs,
    };

    return res.status(200).json({ data: config, error: null });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({
      data: null,
      error: {
        message: "Failed to load SAML Config.",
        values: {
          metadata: message,
        },
      },
    });
  }
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { encodedRawMetadata } = req.body;
  const { slug } = req.query;

  const { apiController } = await jackson();

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  try {
    const samlConfig = await apiController.config({
      encodedRawMetadata,
      defaultRedirectUrl: env.saml.callback,
      redirectUrl: env.saml.callback,
      tenant: team.id,
      product: env.product,
      name: team.name,
      description: "",
    });

    return res.status(200).json({ data: samlConfig, error: null });
  } catch (error: any) {
    const { message } = error;

    return res.status(500).json({
      data: null,
      error: {
        message: "Failed to configure SAML.",
        values: {
          metadata: message,
        },
      },
    });
  }
};
