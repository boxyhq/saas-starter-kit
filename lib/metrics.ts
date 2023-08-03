import packageInfo from '../package.json';
import { initializeMetrics, incrementCounter } from '@boxyhq/metrics';

initializeMetrics({ name: packageInfo.name, version: packageInfo.version });

const prefix = `${packageInfo.name}_`;

export const recordMetric = (metric: string) => {
  incrementCounter({
    meter: packageInfo.name,
    name: `${prefix}${metric}`,
  });
};
