import env from '../env';

export const options = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${env.jackson.apiKey}`,
  },
};
