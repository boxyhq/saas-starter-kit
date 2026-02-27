/**
 * MDR File Conversion Worker
 *
 * Run with: ts-node --transpile-only lib/mdrConversionWorker.ts
 *
 * Picks up jobs from the mdr-file-conversion queue and:
 * 1. Downloads the source file from S3
 * 2. Sends it to Gotenberg for DOCX/XLSX → PDF conversion
 * 3. Uploads the resulting PDF back to S3
 * 4. Updates MdrDocument.pdfS3Key
 */
import { Worker } from 'bullmq';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3';
import { prisma } from './prisma';
import env from './env';
import { convertToPdf } from './gotenberg';
import { redisConnection, type ConversionJobPayload } from './mdrQueue';
import * as Sentry from "@sentry/nextjs";

async function downloadS3Buffer(key: string): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: env.s3.bucket, Key: key })
  );
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const worker = new Worker<ConversionJobPayload>(
  'mdr-file-conversion',
  async (job) => {
    const { documentId } = job.data;

    const doc = await prisma.mdrDocument.findUniqueOrThrow({
      where: { id: documentId },
      select: { id: true, s3Key: true, mimeType: true, originalName: true },
    });

    // Download source file from S3
    const sourceBuffer = await downloadS3Buffer(doc.s3Key);

    // Convert to PDF via Gotenberg
    const pdfBuffer = await convertToPdf(sourceBuffer, doc.originalName);

    // Derive the PDF key from the source key
    const pdfS3Key = doc.s3Key.replace(/\.[^.]+$/, '.pdf');

    // Upload converted PDF to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: pdfS3Key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      })
    );

    // Update the document record with the PDF key
    await prisma.mdrDocument.update({
      where: { id: documentId },
      data: { pdfS3Key },
    });

    console.log(`Converted document ${documentId} → ${pdfS3Key}`);
  },
  {
    connection: redisConnection,
    concurrency: 4,
  }
);

worker.on('failed', (job, error) => {
  console.error(`Conversion job ${job?.id} failed:`, error);
  Sentry.captureException(error, { extra: { jobId: job?.id, data: job?.data } });
});

worker.on('completed', (job) => {
  console.log(`Conversion job ${job.id} completed`);
});

console.log('MDR file conversion worker started');
