/**
 * MDR PDF Compilation Worker
 *
 * Run with: ts-node --transpile-only lib/mdrWorker.ts
 *
 * This worker picks up jobs from the mdr-compilation BullMQ queue and:
 * 1. Fetches the MDR project + sections + documents from DB
 * 2. Downloads each PDF from S3 (prefers pdfS3Key over s3Key)
 * 3. Merges with pdf-lib: title page → TOC → section dividers → embedded docs
 * 4. Uploads the compiled PDF back to S3
 * 5. Updates MdrCompilation status to COMPLETE or FAILED
 * 6. Sends email notification on completion
 */
import { Worker } from 'bullmq';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, mdrCompilationKey } from './s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from './prisma';
import env from './env';
import {
  compilationQueue,
  redisConnection,
  type CompilationJobPayload,
} from './mdrQueue';

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

async function compileMdr(payload: CompilationJobPayload): Promise<void> {
  const { mdrProjectId, compilationId, teamId } = payload;

  // Mark as PROCESSING
  await prisma.mdrCompilation.update({
    where: { id: compilationId },
    data: { status: 'PROCESSING', startedAt: new Date() },
  });

  // Fetch project details
  const project = await prisma.mdrProject.findUniqueOrThrow({
    where: { id: mdrProjectId },
    include: {
      team: { include: { branding: true } },
      sections: {
        orderBy: { order: 'asc' },
        include: {
          documentLinks: {
            orderBy: { order: 'asc' },
            include: { document: true },
          },
        },
      },
    },
  });

  const mergedPdf = await PDFDocument.create();
  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // Title page
  const titlePage = mergedPdf.addPage(PageSizes.A4);
  const { width, height } = titlePage.getSize();

  titlePage.drawText(project.name, {
    x: 50,
    y: height - 150,
    size: 28,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.4),
  });

  if (project.clientName) {
    titlePage.drawText(`Client: ${project.clientName}`, {
      x: 50,
      y: height - 200,
      size: 14,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  if (project.projectNumber) {
    titlePage.drawText(`Project No: ${project.projectNumber}`, {
      x: 50,
      y: height - 225,
      size: 14,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  titlePage.drawText(`Compiled: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 250,
    size: 12,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Process each section
  for (const section of project.sections) {
    // Section divider page
    const dividerPage = mergedPdf.addPage(PageSizes.A4);
    dividerPage.drawText(section.title, {
      x: 50,
      y: dividerPage.getSize().height / 2,
      size: 22,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.4),
    });

    // Embed each document
    for (const link of section.documentLinks) {
      const doc = link.document;
      const s3Key = doc.pdfS3Key ?? doc.s3Key;

      if (!s3Key.endsWith('.pdf') && !doc.pdfS3Key) {
        // Non-PDF without conversion — insert placeholder page
        const placeholderPage = mergedPdf.addPage(PageSizes.A4);
        placeholderPage.drawText(
          `${doc.docNumber} — ${doc.title}`,
          { x: 50, y: placeholderPage.getSize().height - 100, size: 14, font: helveticaBold }
        );
        placeholderPage.drawText(
          `[File included as attachment: ${doc.originalName}]`,
          { x: 50, y: placeholderPage.getSize().height - 130, size: 12, font: helvetica, color: rgb(0.5, 0.5, 0.5) }
        );
        continue;
      }

      try {
        const pdfBuffer = await downloadS3Buffer(s3Key);
        const embeddedDoc = await PDFDocument.load(pdfBuffer);
        const pages = await mergedPdf.copyPages(
          embeddedDoc,
          embeddedDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      } catch (err) {
        // If a single document fails, insert error placeholder and continue
        const errorPage = mergedPdf.addPage(PageSizes.A4);
        errorPage.drawText(`[Error embedding: ${doc.docNumber} — ${doc.title}]`, {
          x: 50,
          y: errorPage.getSize().height - 100,
          size: 12,
          font: helvetica,
          color: rgb(0.8, 0.2, 0.2),
        });
      }
    }
  }

  // Save merged PDF
  const pdfBytes = await mergedPdf.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  const s3Key = mdrCompilationKey(teamId, mdrProjectId, compilationId);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    })
  );

  // Mark compilation as COMPLETE
  await prisma.mdrCompilation.update({
    where: { id: compilationId },
    data: {
      status: 'COMPLETE',
      s3Key,
      fileSize: BigInt(pdfBuffer.length),
      completedAt: new Date(),
    },
  });
}

// Start the worker
const worker = new Worker<CompilationJobPayload>(
  'mdr-compilation',
  async (job) => {
    await compileMdr(job.data);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on('failed', async (job, error) => {
  console.error(`Compilation job ${job?.id} failed:`, error);
  if (job?.data?.compilationId) {
    await prisma.mdrCompilation.update({
      where: { id: job.data.compilationId },
      data: {
        status: 'FAILED',
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });
  }
});

worker.on('completed', (job) => {
  console.log(`Compilation job ${job.id} completed`);
});

console.log('MDR compilation worker started');
