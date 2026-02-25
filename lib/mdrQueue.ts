import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import env from './env';

export const redisConnection = new IORedis(env.redis.url, {
  maxRetriesPerRequest: null,
});

export interface CompilationJobPayload {
  mdrProjectId: string;
  compilationId: string;
  teamId: string;
}

export interface ConversionJobPayload {
  documentId: string;
  teamId: string;
  mdrProjectId: string;
}

export interface CleanupJobPayload {
  type: 'delete_project' | 'archive_project' | 'finalize_project';
  mdrProjectId: string;
  teamId: string;
  keepSourceDocs?: boolean;
}

export const compilationQueue = new Queue<CompilationJobPayload>(
  'mdr-compilation',
  { connection: redisConnection }
);

export const conversionQueue = new Queue<ConversionJobPayload>(
  'mdr-file-conversion',
  { connection: redisConnection }
);

export const cleanupQueue = new Queue<CleanupJobPayload>('mdr-s3-cleanup', {
  connection: redisConnection,
});

export const usageAlertQueue = new Queue('mdr-usage-alerts', {
  connection: redisConnection,
});
