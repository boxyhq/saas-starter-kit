import env from '@/lib/env';
import { jacksonHosted } from './hosted';
import { jacksonEmbedded } from './embed';

export const ssoManager = () => {
  if (env.jackson.selfHosted) {
    return new jacksonHosted();
  } else {
    return new jacksonEmbedded();
  }
};
