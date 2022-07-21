import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@prisma/client";

import type { ApiResponse } from "types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  const { name } = req.body;

  const session = await getSession(req, res);

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: { name },
  });

  res.status(200).json({ data: user, error: null });
}
