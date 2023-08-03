import packageInfo from '../package.json';
import { initializeMetrics, incrementCounter } from '@boxyhq/metrics';

initializeMetrics({ name: packageInfo.name, version: packageInfo.version });

export const recordMetric = (metric: string) => {
  incrementCounter({
    meter: packageInfo.name,
    name: metric,
  });
};
