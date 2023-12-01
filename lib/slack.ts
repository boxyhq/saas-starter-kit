import SlackNotify from 'slack-notify';

import env from './env';

export const slackNotify = () => {
  if (!env.slackWebhookUrl) {
    return;
  }

  return SlackNotify(env.slackWebhookUrl);
};
