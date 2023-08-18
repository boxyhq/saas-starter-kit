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
  try {
    const { pull_number, owner, repo } = req.query;
    const pullNumber = parseInt('' + pull_number, 10);

    await octokit.request(
      'POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
      {
        owner: owner as string,
        repo: repo as string,
        pull_number: pullNumber,
        event: 'APPROVE',
      }
    );

    // console.log('response:', response);

    await octokit.request(
      'PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge',
      {
        owner: owner as string,
        repo: repo as string,
        pull_number: pullNumber,
        merge_method: 'squash',
      }
    );

    // console.log('response1:', response1);

    res.status(200).json({});
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
