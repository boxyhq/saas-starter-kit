import { Octokit } from '@octokit/core';
import { slugify } from '@/lib/common';
import { ApiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { createTeam, isTeamExists } from 'models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get teams
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { owner, repo, excludes } = req.query;

  let excludesList = {};
  if (excludes) {
    excludesList = JSON.parse(excludes as string);
  }

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
      owner: owner as string,
      repo: repo as string,
      state: 'open',
    });

    const prs = response.data.filter((pr) => {
      if (pr.user!.login === 'dependabot[bot]') {
        const excluded = excludesList[`${owner}/${repo}`] || [];
        for (const exc of excluded) {
          if (pr.title.startsWith(`Bump ${exc} from`)) {
            return false;
          }
        }
        return true;
      }

      return false;
    });

    // console.log('prs:', prs);

    res.status(200).json({
      data: prs,
    });
  } catch (error: any) {
    console.error('error:', error);
    res
      .status(error.status || 500)
      .json({ error: { message: 'Something went wrong' } });
  }
};

// Create a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name } = req.body;

  const session = await getSession(req, res);
  const slug = slugify(name);

  if (await isTeamExists([{ slug }])) {
    throw new ApiError(400, 'A team with the name already exists.');
  }

  const team = await createTeam({
    userId: session?.user?.id as string,
    name,
    slug,
  });

  res.status(200).json({ data: team });
};
