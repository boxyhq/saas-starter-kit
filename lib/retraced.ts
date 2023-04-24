import type { Team } from '@prisma/client';
import { Client, Event } from '@retracedhq/retraced';
import type { CRUD } from '@retracedhq/retraced';
import { User } from 'next-auth';
import type { EventType } from 'types';

import env from './env';

const retraced = new Client({
  endpoint: env.retraced.url,
  apiKey: env.retraced.apiKey,
  projectId: env.retraced.projectId,
});

type Request = {
  action: EventType;
  user: User;
  team: Team;
  crud: CRUD;
  // target: Target;
};

export const reportEvent = async (request: Request) => {
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

  return await retraced.reportEvent(event);
};
