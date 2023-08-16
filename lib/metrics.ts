import { initializeMetrics, incrementCounter } from '@boxyhq/metrics';

import type { AppEvent } from 'types';
import packageInfo from '../package.json';

initializeMetrics({ name: packageInfo.name, version: packageInfo.version });

const prefix = `${packageInfo.name}.`;
const meter = packageInfo.name;

export const recordMetric = (metric: AppEvent) => {
  incrementCounter({
    meter,
    name: `${prefix}${metric}`,
  });
};
