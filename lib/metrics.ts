import packageInfo from '../package.json';
import { initializeMetrics, incrementCounter } from '@boxyhq/metrics';

initializeMetrics({ name: packageInfo.name, version: packageInfo.version });

const prefix = `${packageInfo.name}.`;
const meter = packageInfo.name;

export const recordMetric = (metric: string) => {
  incrementCounter({
    meter,
    name: `${prefix}${metric}`,
  });
};
