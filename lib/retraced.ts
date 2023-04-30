import type { Team } from '@prisma/client';
import { Client } from '@retracedhq/retraced';
import type { CRUD, Event } from '@retracedhq/retraced';
import type { User } from 'next-auth';

import env from './env';

export type EventType =
  | 'member.invitation.create'
  | 'member.invitation.delete'
  | 'member.remove'
  | 'member.update'
  | 'sso.connection.create'
  | 'dsync.connection.create'
  | 'webhook.create'
  | 'webhook.delete'
  | 'webhook.update'
  | 'team.create'
  | 'team.update'
  | 'team.delete';

type Request = {
  action: EventType;
  user: User;
  team: Team;
  crud: CRUD;
  // target: Target;
};

export const retracedClient = new Client({
  endpoint: env.retraced.url,
  apiKey: env.retraced.apiKey,
  projectId: env.retraced.projectId,
});

export const sendAudit = async (request: Request) => {
  const { action, user, team, crud } = request;

  const event: Event = {
    action,
    crud,
    group: {
      id: team.id,
      name: team.name,
    },
    actor: {
      id: user.id,
      name: user.name as string,
    },
  };

  return await retracedClient.reportEvent(event);
};
