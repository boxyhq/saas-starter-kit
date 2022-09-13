import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/common";
import type { Team } from "@prisma/client";

export const createTeam = async (param: { name: string; tenantId: string }) => {
  const { name, tenantId } = param;

  return await prisma.team.create({
    data: {
      name: slugify(name),
      tenantId,
    },
  });
};

export const getTeams = async (tenantId: string) => {
  return await prisma.team.findMany({
    where: {
      tenantId,
    },
  });
};

export const getTeam = async (key: { id: string } | { name: string }) => {
  return await prisma.team.findFirstOrThrow({
    where: key,
  });
};

export const updateTeam = async (id: string, data: Partial<Team>) => {
  return await prisma.team.update({
    where: { id },
    data,
  });
};

const teams = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
};

export default teams;
