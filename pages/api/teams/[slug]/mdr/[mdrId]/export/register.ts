import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess, getCurrentUserWithTeam } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { ApiError } from '@/lib/errors';
import { assertMdrAccess, assertMdrOwnership } from '@/lib/mdr';
import { buildRegisterWorkbook, buildRegisterCsv } from '@/lib/mdrExport';
import env from '@/lib/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: { message: 'Method Not Allowed' } });
    }

    if (!env.teamFeatures.mdr) throw new ApiError(404, 'Not Found');

    await throwIfNoTeamAccess(req, res);
    const user = await getCurrentUserWithTeam(req, res);
    throwIfNotAllowed(user, 'mdr', 'read');

    const { mdrId, format } = req.query as {
      mdrId: string;
      format?: string;
    };
    await assertMdrOwnership(mdrId, user.team.id);
    await assertMdrAccess(mdrId, user.id, user.team.id);

    if (format === 'csv') {
      const csv = await buildRegisterCsv(mdrId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="document-register.csv"'
      );
      return res.status(200).send(csv);
    }

    const buffer = await buildRegisterWorkbook(mdrId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="document-register.xlsx"'
    );
    res.status(200).send(buffer);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: { message: error.message || 'Something went wrong' } });
  }
}
