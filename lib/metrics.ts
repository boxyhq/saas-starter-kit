import { initializeMetrics, incrementCounter } from '@boxyhq/metrics';

import type { AppEvent } from 'types';
import packageInfo from '../package.json';
import env from './env';

initializeMetrics({ name: packageInfo.name, version: packageInfo.version });

const { prefix } = env.otel;
const meter = packageInfo.name;

export const recordMetric = (metric: AppEvent) => {
  if (
    !process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
    !process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS ||
    !process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL
  ) {
    return;
  }

  incrementCounter({
    meter,
    name: `${prefix}.${metric}`,
  });
};
