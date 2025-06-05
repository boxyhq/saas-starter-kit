import { ApiError } from '@/lib/errors';
import { Action, Resource, permissions } from '@/lib/permissions';
import supabase from '@/lib/supabase';
import { Role, TeamMember } from '@prisma/client';
import type { Session } from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { maxLengthPolicies } from '@/lib/common';

export const normalizeUser = (user) => {
  if (user?.name) {
    user.name = user.name.substring(0, maxLengthPolicies.name);
  }

  return user;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
}) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user, error } = await supabase
    .from('User')
    .insert(normalizeUser(data))
    .select()
    .single();
  if (error) throw error;
  return user;
};

export const updateUser = async ({ where, data }) => {
  if (!supabase) throw new Error('Supabase not configured');
  data = normalizeUser(data);
  const key = 'id' in where ? { id: where.id } : { email: where.email };
  const { data: user, error } = await supabase
    .from('User')
    .update(data)
    .match(key)
    .select()
    .single();
  if (error) throw error;
  return user;
};

export const upsertUser = async ({ where, update, create }) => {
  if (!supabase) throw new Error('Supabase not configured');
  update = normalizeUser(update);
  create = normalizeUser(create);
  const key = 'id' in where ? { id: where.id } : { email: where.email };
  const { data: user, error } = await supabase
    .from('User')
    .upsert({ ...create, ...key, ...update })
    .select()
    .single();
  if (error) throw error;
  return user;
};

export const getUser = async (key: { id: string } | { email: string }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .match(key)
    .maybeSingle();
  if (error) throw error;
  return normalizeUser(user);
};

export const getUserBySession = async (session: Session | null) => {
  if (session === null || session.user === null) {
    return null;
  }

  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await getUser({ id });
};

export const deleteUser = async (key: { id: string } | { email: string }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user, error } = await supabase
    .from('User')
    .delete()
    .match(key)
    .select()
    .single();
  if (error) throw error;
  return user;
};

export const findFirstUserOrThrow = async ({ where }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .match(where)
    .maybeSingle();
  if (error || !user) throw error || new Error('User not found');
  return normalizeUser(user);
};

const isAllowed = (role: Role, resource: Resource, action: Action) => {
  const rolePermissions = permissions[role];

  if (!rolePermissions) {
    return false;
  }

  for (const permission of rolePermissions) {
    if (
      permission.resource === resource &&
      (permission.actions === '*' || permission.actions.includes(action))
    ) {
      return true;
    }
  }

  return false;
};

export const throwIfNotAllowed = (
  user: Pick<TeamMember, 'role'>,
  resource: Resource,
  action: Action
) => {
  if (isAllowed(user.role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `You are not allowed to perform ${action} on ${resource}`
  );
};

// Get current user from session
export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
};
