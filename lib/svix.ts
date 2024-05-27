import { EndpointIn, Svix } from 'svix';

import env from './env';
import type { AppEvent } from 'types';

const svixDisabled = !env.svix.apiKey || !env.teamFeatures.webhook;
const svix = !svixDisabled ? new Svix(env.svix.apiKey) : null;

export const findOrCreateApp = async (name: string, uid: string) => {
  return await svix?.application.getOrCreate({ name, uid });
};

export const createWebhook = async (appId: string, data: EndpointIn) => {
  return await svix?.endpoint.create(appId, data);
};

export const updateWebhook = async (
  appId: string,
  endpointId: string,
  data: EndpointIn
) => {
  return await svix?.endpoint.update(appId, endpointId, data);
};

export const findWebhook = async (appId: string, endpointId: string) => {
  return await svix?.endpoint.get(appId, endpointId);
};

export const listWebhooks = async (appId: string) => {
  return await svix?.endpoint.list(appId);
};

export const deleteWebhook = async (appId: string, endpointId: string) => {
  return await svix?.endpoint.delete(appId, endpointId);
};

export const sendEvent = async (
  appId: string,
  eventType: AppEvent,
  payload: Record<string, unknown>
) => {
  return await svix?.message.create(appId, {
    eventType,
    payload: {
      event: eventType,
      data: payload,
    },
  });
};
