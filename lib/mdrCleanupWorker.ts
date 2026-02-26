/**
 * MDR S3 Cleanup Worker
 *
 * Run with: ts-node --transpile-only lib/mdrCleanupWorker.ts
 *
 * Picks up jobs from the mdr-s3-cleanup queue and:
 *   delete_project   → Deletes all S3 objects for the project (respects cross-MDR refs)
 *   archive_project  → Moves compiled PDFs to GLACIER_IR; source docs stay in STANDARD
 *   finalize_project → Moves compiled PDFs to GLACIER_IR; optionally archives source docs too
 */
import { Worker } from 'bullmq';
import { prisma } from './prisma';
import { redisConnection, type CleanupJobPayload } from './mdrQueue';
import {
  deleteProjectS3Objects,
  archiveS3Object,
} from './s3Lifecycle';

async function handleDeleteProject(mdrProjectId: string): Promise<void> {
  await deleteProjectS3Objects(mdrProjectId);
  console.log(`[cleanup] delete_project: all S3 objects deleted for ${mdrProjectId}`);
}

async function handleArchiveProject(mdrProjectId: string): Promise<void> {
  // Archive compiled PDFs only — source docs remain in STANDARD storage
  const compilations = await prisma.mdrCompilation.findMany({
    where: { mdrProjectId, s3Key: { not: null } },
    select: { s3Key: true },
  });

  await Promise.allSettled(
    compilations
      .filter((c) => c.s3Key)
      .map((c) => archiveS3Object(c.s3Key!))
  );

  console.log(
    `[cleanup] archive_project: ${compilations.length} compilation(s) archived for ${mdrProjectId}`
  );
}

async function handleFinalizeProject(
  mdrProjectId: string,
  keepSourceDocs: boolean
): Promise<void> {
  // Always archive compiled PDFs
  const compilations = await prisma.mdrCompilation.findMany({
    where: { mdrProjectId, s3Key: { not: null } },
    select: { s3Key: true },
  });

  await Promise.allSettled(
    compilations
      .filter((c) => c.s3Key)
      .map((c) => archiveS3Object(c.s3Key!))
  );

  if (!keepSourceDocs) {
    // Also archive source document files and their converted PDFs
    const documents = await prisma.mdrDocument.findMany({
      where: { mdrProjectId },
      select: { s3Key: true, pdfS3Key: true },
    });

    const keysToArchive: string[] = [];
    for (const doc of documents) {
      keysToArchive.push(doc.s3Key);
      if (doc.pdfS3Key) keysToArchive.push(doc.pdfS3Key);
    }

    await Promise.allSettled(keysToArchive.map((key) => archiveS3Object(key)));

    console.log(
      `[cleanup] finalize_project: ${compilations.length} compilation(s) + ${documents.length} document(s) archived for ${mdrProjectId}`
    );
  } else {
    console.log(
      `[cleanup] finalize_project: ${compilations.length} compilation(s) archived (source docs kept) for ${mdrProjectId}`
    );
  }
}

const worker = new Worker<CleanupJobPayload>(
  'mdr-s3-cleanup',
  async (job) => {
    const { type, mdrProjectId, keepSourceDocs } = job.data;

    switch (type) {
      case 'delete_project':
        await handleDeleteProject(mdrProjectId);
        break;

      case 'archive_project':
        await handleArchiveProject(mdrProjectId);
        break;

      case 'finalize_project':
        await handleFinalizeProject(mdrProjectId, keepSourceDocs ?? true);
        break;

      default:
        console.warn(`[cleanup] Unknown job type: ${type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on('failed', (job, error) => {
  console.error(`[cleanup] Job ${job?.id} (type: ${job?.data?.type}) failed:`, error);
});

worker.on('completed', (job) => {
  console.log(`[cleanup] Job ${job.id} (type: ${job.data.type}) completed`);
});

console.log('MDR S3 cleanup worker started');
