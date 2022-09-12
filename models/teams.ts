import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/common";

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

const teams = {
  createTeam,
  getTeams,
};

export default teams;
