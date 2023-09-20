import { EndpointIn, Svix } from 'svix';

import env from './env';
import type { AppEvent } from 'types';

const svix = new Svix(env.svix.apiKey);

export const findOrCreateApp = async (name: string, uid: string) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.application.getOrCreate({ name, uid });
};

export const createWebhook = async (appId: string, data: EndpointIn) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.endpoint.create(appId, data);
};

export const updateWebhook = async (
  appId: string,
  endpointId: string,
  data: EndpointIn
) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.endpoint.update(appId, endpointId, data);
};

export const findWebhook = async (appId: string, endpointId: string) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.endpoint.get(appId, endpointId);
};

export const listWebhooks = async (appId: string) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.endpoint.list(appId);
};

export const deleteWebhook = async (appId: string, endpointId: string) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.endpoint.delete(appId, endpointId);
};

export const sendEvent = async (
  appId: string,
  eventType: AppEvent,
  payload: Record<string, unknown>
) => {
  if (!env.svix.apiKey) {
    return;
  }

  return await svix.message.create(appId, {
    eventType,
    payload: {
      event: eventType,
      data: payload,
    },
  });
};
