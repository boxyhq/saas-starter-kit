import env from '@/lib/env';
import { JacksonHosted } from './hosted';
import { JacksonEmbedded } from './embed';

export const dsyncManager = () => {
  if (env.jackson.selfHosted) {
    return new JacksonHosted();
  } else {
    return new JacksonEmbedded();
  }
};
