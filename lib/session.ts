import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { unstable_getServerSession } from 'next-auth/next';

import { authOptions } from '../pages/api/auth/[...nextauth]';

export const getSession = async (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
) => {
  return await unstable_getServerSession(req, res, authOptions);
};
