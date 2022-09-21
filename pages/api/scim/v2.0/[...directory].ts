import type { NextApiRequest, NextApiResponse } from "next";

import type {
  DirectorySyncRequest,
  HTTPMethod,
  DirectorySyncEvent,
} from "@boxyhq/saml-jackson";
import jackson from "@/lib/jackson";
import { createRandomString, extractAuthToken } from "@/lib/common";
import { deleteUser, getUser } from "models/user";
import { addTeamMember } from "models/team";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { directorySync } = await jackson();

  const { method, query, body } = req;

  const directory = query.directory as string[];
  const [directoryId, path, resourceId] = directory;

  // Handle the SCIM API requests
  const request: DirectorySyncRequest = {
    method: method as HTTPMethod,
    body: body ? JSON.parse(body) : undefined,
    directoryId,
    resourceId,
    resourceType: path === "Users" ? "users" : "groups",
    apiSecret: extractAuthToken(req),
    query: {
      count: req.query.count ? parseInt(req.query.count as string) : undefined,
      startIndex: req.query.startIndex
        ? parseInt(req.query.startIndex as string)
        : undefined,
      filter: req.query.filter as string,
    },
  };

  const { status, data } = await directorySync.requests.handle(
    request,
    handleEvents
  );

  return res.status(status).json(data);
}

// Handle the SCIM events
const handleEvents = async (event: DirectorySyncEvent) => {
  const { event: action, tenant: teamId, data } = event;

  // User has been created
  if (action === "user.created" && "email" in data) {
    const user = await prisma.user.upsert({
      where: {
        email: data.email,
      },
      update: {
        name: `${data.first_name} ${data.last_name}`,
      },
      create: {
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        password: await hashPassword(createRandomString()),
      },
    });

    await addTeamMember(teamId, user.id, "member");
  }

  // User has been updated
  if (action === "user.updated" && "email" in data) {
    if (data.active === true) {
      const user = await prisma.user.upsert({
        where: {
          email: data.email,
        },
        update: {
          name: `${data.first_name} ${data.last_name}`,
        },
        create: {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          password: await hashPassword(createRandomString()),
        },
      });

      await addTeamMember(teamId, user.id, "member");

      return;
    }

    const user = await getUser({ email: data.email });

    if (!user) {
      return;
    }

    if (data.active === false) {
      await deleteUser({ id: user.id });
    }
  }

  // User has been removed
  if (action === "user.deleted" && "email" in data) {
    await deleteUser({ email: data.email });
  }
};
