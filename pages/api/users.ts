import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "PUT":
      return handlePUT(req, res);
    case "PATCH":
      return handlePATCH(req, res);
    default:
      res.setHeader("Allow", ["PUT", "PATCH"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.body;

  const session = await getSession(req, res);

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: { name },
  });

  return res.status(200).json({ data: user, error: null });
};

const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const { password } = req.body;
  let infoToUpdate = {};

  if (password) {
    const hash = await hashPassword(password);
    infoToUpdate = { password: hash };
  }

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: infoToUpdate,
  });

  return res.status(200).json({ data: user, error: null });
};
