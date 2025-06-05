import { prisma } from '@/lib/prisma';

export const createGroup = async (data: { id: string; name: string; teamId: string; raw?: any }) => {
  return await prisma.group.create({ data });
};

export const updateGroup = async ({ where, data }: { where: { id: string }; data: { name?: string; raw?: any } }) => {
  return await prisma.group.update({ where, data });
};

export const deleteGroup = async (id: string) => {
  return await prisma.group.delete({ where: { id } });
};

export const upsertGroup = async ({ where, create, update }: { where: { id: string }; create: { id: string; name: string; teamId: string; raw?: any }; update: { name?: string; raw?: any } }) => {
  return await prisma.group.upsert({ where, create, update });
};
