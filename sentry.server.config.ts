import * as Sentry from '@sentry/nextjs';
import packageJson from './package.json';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
  release: packageJson.version,
});
