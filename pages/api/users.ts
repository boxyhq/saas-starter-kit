import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

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
  const { confirmationPassword, currentPassword, newPassword } = req.body;
  let infoToUpdate = {};

  if (currentPassword) {
    const user = await prisma.user.findFirst({
      where: { id: session?.user.id },
    });

    const currentPasswordIsValid = await verifyPassword(
      currentPassword,
      String(user?.password)
    );
    const confirmPasswordAndNewPasswordAreEqual =
      confirmationPassword === newPassword;

    if (!currentPasswordIsValid)
      return res
        .status(400)
        .json({ data: null, error: { message: "Wrong current password" } });
    if (!confirmPasswordAndNewPasswordAreEqual)
      return res.status(400).json({
        data: null,
        error: {
          message: "New password and confirmation password don't match",
        },
      });

    const hash = await hashPassword(confirmationPassword);
    infoToUpdate = { password: hash };
  }

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: infoToUpdate,
  });

  return res.status(200).json({ data: user, error: null });
};
