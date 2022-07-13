import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "PUT":
      return handlePUT(req, res);
    default:
      res.setHeader("Allow", ["PUT"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const tenantSlug = req.query.slug as string;
  const { name, slug, domain } = req.body;

  const tenant = await prisma.tenant.update({
    where: { slug: tenantSlug },
    data: { name, slug, domain },
  });

  return res.status(200).json({ data: tenant, error: null });
};
