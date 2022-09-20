import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@/lib/session";
import {
  createInvitation,
  getInvitations,
  getInvitation,
  deleteInvitation,
} from "models/invitation";
import { addTeamMember, getTeam, isTeamMember } from "models/team";
import { sendTeamInviteEmail } from "@/lib/email/sendTeamInviteEmail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["POST", "PUT", "GET", "DELETE"]);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Invite a user to an team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, role } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const invitation = await createInvitation({
    teamId: team.id,
    invitedBy: userId,
    email,
    role,
  });

  await sendTeamInviteEmail(team, invitation);

  return res.status(200).json({ data: invitation, error: null });
};

// Get all invitations for an organization
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const invitations = await getInvitations(team.id);

  return res.status(200).json({ data: invitations, error: null });
};

// Delete an invitation
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.body;
  const { slug } = req.query;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const team = await getTeam({ slug: slug as string });

  if (!(await isTeamMember(userId, team?.id))) {
    return res.status(400).json({
      data: null,
      error: { message: "Bad request." },
    });
  }

  const invitation = await getInvitation({ id });

  if (invitation.invitedBy != userId || invitation.teamId != team.id) {
    return res.status(400).json({
      data: null,
      error: {
        message: "You don't have permission to delete this invitation.",
      },
    });
  }

  await deleteInvitation({ id });

  return res.status(200).json({ data: {}, error: null });
};

// Accept an invitation to an organization
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { inviteToken } = req.body;

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  const invitation = await getInvitation({ token: inviteToken as string });

  await addTeamMember(invitation.team.id, userId, invitation.role);

  await deleteInvitation({ token: inviteToken as string });

  return res.status(200).json({ data: {}, error: null });
};
