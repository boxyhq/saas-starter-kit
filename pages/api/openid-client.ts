// Leave the openid-client import to get nextjs to leave the library in node_modules after build
import * as dummy from 'openid-client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const unused = dummy; // eslint-disable-line @typescript-eslint/no-unused-vars
  res.status(200).json({});
}
