import type { NextApiRequest, NextApiResponse } from "next";

import jackson from "@/lib/jackson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { directorySync } = await jackson();

  // List of directory sync providers
  res.status(200).json({ data: directorySync.providers(), error: null });
}
