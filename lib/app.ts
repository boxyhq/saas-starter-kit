import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: 'RealtyIqs',
  logoUrl: '',
  url: env.appUrl,
};

export default app;
