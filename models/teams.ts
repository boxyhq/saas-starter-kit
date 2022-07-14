import type { User } from "@prisma/client";
import { createUniqueId } from "@lib/common";

export const createTeam = async (
  name: string,
  slug: string,
  userId: string | undefined
) => {
  if (!userId) {
    throw new Error("User id is required");
  }

  return [];

  // return await prisma.team.create({
  //   data: {
  //     name,
  //     tenantId: "1",
  //     memberships: {
  //       create: {
  //         userId,
  //         role: defaultRole,
  //       },
  //     },
  //   },
  // });
};

export const createDefaultTeam = async (user: User) => {
  const slug = createUniqueId();
  const name = user.name;

  return await createTeam(name, slug, user.id);
};

export const getTeams = async (userId: string | undefined) => {
  if (!userId) {
    throw new Error("User id is required");
  }

  return {};

  // return await prisma.team.findMany({
  //   where: {
  //     memberships: {
  //       every: {
  //         userId,
  //       },
  //     },
  //   },
  // });
};
