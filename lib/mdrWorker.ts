/**
 * MDR PDF Compilation Worker
 *
 * Run with: ts-node --transpile-only lib/mdrWorker.ts
 *
 * This worker picks up jobs from the mdr-compilation BullMQ queue and:
 * 1. Fetches the MDR project + sections + documents from DB
 * 2. Downloads each PDF from S3 (prefers pdfS3Key over s3Key)
 * 3. Merges with pdf-lib: title page → section dividers → embedded docs
 * 4. Applies team branding (logo + primary colour) to generated pages
 * 5. Uploads the compiled PDF back to S3
 * 6. Updates MdrCompilation status to COMPLETE or FAILED
 */
import { Worker } from 'bullmq';
import { PDFDocument, PDFImage, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, mdrCompilationKey } from './s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from './prisma';
import env from './env';
import {
  redisConnection,
  type CompilationJobPayload,
} from './mdrQueue';
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

/** Parse a CSS hex colour string into a pdf-lib rgb() colour. */
function hexToRgbColor(hex: string) {
  const h = hex.replace('#', '').padEnd(6, '0');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
}

/** Scale image pixel dimensions to fit inside a pt bounding box, preserving aspect ratio. */
function scaledDims(
  imgW: number,
  imgH: number,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  const ratio = imgW / imgH;
  let w = Math.min(imgW, maxW);
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { w, h };
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

  // ── Branding ─────────────────────────────────────────────────────────────────
  const branding = project.team.branding;
  const primaryRgb = branding?.primaryColor
    ? hexToRgbColor(branding.primaryColor)
    : rgb(0.1, 0.1, 0.4);
  const placements: string[] = branding?.logoPlacements
    ? JSON.parse(branding.logoPlacements)
    : [];

  const mergedPdf = await PDFDocument.create();

  // Embed team logo once (PNG or JPEG only; SVG/WebP silently skipped)
  let logoImage: PDFImage | null = null;
  if (branding?.logoS3Key) {
    try {
      const logoBuffer = await downloadS3Buffer(branding.logoS3Key);
      const key = branding.logoS3Key.toLowerCase();
      logoImage =
        key.endsWith('.jpg') || key.endsWith('.jpeg')
          ? await mergedPdf.embedJpg(logoBuffer)
          : await mergedPdf.embedPng(logoBuffer);
    } catch {
      // Unsupported format or S3 download error — compile without logo
    }
  }

  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  // ── Cover page ──────────────────────────────────────────────────────────────
  const titlePage = mergedPdf.addPage(PageSizes.A4);
  const { width, height } = titlePage.getSize();
  const bannerH = 110;

  // Coloured top banner
  titlePage.drawRectangle({
    x: 0,
    y: height - bannerH,
    width,
    height: bannerH,
    color: primaryRgb,
  });

  // Logo in banner (cover placement)
  if (logoImage && placements.includes('cover')) {
    const { w, h } = scaledDims(logoImage.width, logoImage.height, 160, 80);
    titlePage.drawImage(logoImage, {
      x: 15,
      y: height - bannerH + (bannerH - h) / 2,
      width: w,
      height: h,
    });
  }

  // "MASTER DOCUMENT REGISTER" label — right-aligned in banner
  const bannerLabel = 'MASTER DOCUMENT REGISTER';
  const bannerLabelSize = 10;
  const bannerLabelW = helveticaBold.widthOfTextAtSize(bannerLabel, bannerLabelSize);
  titlePage.drawText(bannerLabel, {
    x: width - bannerLabelW - 20,
    y: height - bannerH / 2 - 5,
    size: bannerLabelSize,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // Project name
  titlePage.drawText(project.name, {
    x: 50,
    y: height - bannerH - 70,
    size: 28,
    font: helveticaBold,
    color: primaryRgb,
  });

  if (project.clientName) {
    titlePage.drawText(`Client: ${project.clientName}`, {
      x: 50,
      y: height - bannerH - 120,
      size: 14,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  if (project.projectNumber) {
    titlePage.drawText(`Project No: ${project.projectNumber}`, {
      x: 50,
      y: height - bannerH - 145,
      size: 14,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  titlePage.drawText(`Compiled: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - bannerH - 170,
    size: 12,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Bottom accent strip
  titlePage.drawRectangle({ x: 0, y: 0, width, height: 8, color: primaryRgb });

  // ── Sections ─────────────────────────────────────────────────────────────────
  for (const section of project.sections) {
    // Section divider page
    const dividerPage = mergedPdf.addPage(PageSizes.A4);
    const { width: dw, height: dh } = dividerPage.getSize();
    const divBannerH = 80;

    // Coloured top strip
    dividerPage.drawRectangle({
      x: 0,
      y: dh - divBannerH,
      width: dw,
      height: divBannerH,
      color: primaryRgb,
    });

    // Small logo in divider strip (header placement)
    if (logoImage && placements.includes('header')) {
      const { w, h } = scaledDims(logoImage.width, logoImage.height, 100, 50);
      dividerPage.drawImage(logoImage, {
        x: 15,
        y: dh - divBannerH + (divBannerH - h) / 2,
        width: w,
        height: h,
      });
    }

    // Section title centred in the remaining page area
    dividerPage.drawText(section.title, {
      x: 50,
      y: dh - divBannerH - (dh - divBannerH) / 2 - 11,
      size: 22,
      font: helveticaBold,
      color: primaryRgb,
    });

    // Bottom accent strip
    dividerPage.drawRectangle({ x: 0, y: 0, width: dw, height: 8, color: primaryRgb });

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
        pages.forEach((page) => {
          mergedPdf.addPage(page);

          // Overlay header strip (logo on white band at top of each page)
          if (logoImage && placements.includes('header')) {
            const { width: pw, height: ph } = page.getSize();
            const hdrH = 24;
            page.drawRectangle({ x: 0, y: ph - hdrH, width: pw, height: hdrH, color: rgb(1, 1, 1) });
            const { w, h } = scaledDims(logoImage.width, logoImage.height, 80, hdrH - 6);
            page.drawImage(logoImage, { x: 8, y: ph - hdrH + (hdrH - h) / 2, width: w, height: h });
          }

          // Overlay footer strip (logo on white band at bottom of each page)
          if (logoImage && placements.includes('footer')) {
            const { width: pw } = page.getSize();
            const ftrH = 20;
            page.drawRectangle({ x: 0, y: 0, width: pw, height: ftrH, color: rgb(1, 1, 1) });
            const { w, h } = scaledDims(logoImage.width, logoImage.height, 60, ftrH - 4);
            page.drawImage(logoImage, { x: 8, y: (ftrH - h) / 2, width: w, height: h });
          }
        });
      } catch {
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
  Sentry.captureException(error, { extra: { jobId: job?.id, data: job?.data } });
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
