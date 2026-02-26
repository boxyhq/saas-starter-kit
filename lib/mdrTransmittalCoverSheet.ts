/**
 * MDR Transmittal Cover Sheet Generator
 *
 * Produces a branded A4 PDF cover sheet for a document transmittal.
 * Uses pdf-lib — same dependency as the MDR compilation worker.
 */
import { PDFDocument, PDFImage, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3';
import env from './env';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransmittalBranding {
  primaryColor?: string | null;
  logoS3Key?: string | null;
  logoPlacements?: string | null;
}

export interface TransmittalDocRow {
  docNumber: string;
  title: string;
  discipline?: string | null;
  revisionAtIssue: string;
}

export interface TransmittalCoverSheetData {
  transmittalNumber: string;
  purpose: string;
  toName?: string | null;
  toEmail?: string | null;
  fromName?: string | null;
  notes?: string | null;
  issuedAt: Date;
  projectName: string;
  projectNumber?: string | null;
  clientName?: string | null;
  documents: TransmittalDocRow[];
  branding: TransmittalBranding | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PURPOSE_LABELS: Record<string, string> = {
  IFC: 'Issued for Construction',
  IFA: 'Issued for Approval',
  IFI: 'Issued for Information',
  FOR_REVIEW: 'For Review',
  FOR_APPROVAL: 'For Approval',
  FOR_INFORMATION: 'For Information',
};

function hexToRgbColor(hex: string) {
  const h = hex.replace('#', '').padEnd(6, '0');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
}

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

// ── Generator ─────────────────────────────────────────────────────────────────

export async function generateTransmittalCoverSheet(
  data: TransmittalCoverSheetData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const branding = data.branding;
  const primaryColor = branding?.primaryColor
    ? hexToRgbColor(branding.primaryColor)
    : rgb(0.1, 0.1, 0.4);
  const placements: string[] = branding?.logoPlacements
    ? JSON.parse(branding.logoPlacements)
    : [];

  // Embed team logo (PNG / JPEG only; errors silently skipped)
  let logoImage: PDFImage | null = null;
  if (branding?.logoS3Key) {
    try {
      const logoBuffer = await downloadS3Buffer(branding.logoS3Key);
      const key = branding.logoS3Key.toLowerCase();
      logoImage =
        key.endsWith('.jpg') || key.endsWith('.jpeg')
          ? await pdfDoc.embedJpg(logoBuffer)
          : await pdfDoc.embedPng(logoBuffer);
    } catch {
      // Non-fatal — compile without logo
    }
  }

  // ── Header banner ──────────────────────────────────────────────────────────
  const bannerH = 90;
  page.drawRectangle({
    x: 0,
    y: height - bannerH,
    width,
    height: bannerH,
    color: primaryColor,
  });

  // Logo in banner (if 'cover' placement configured)
  if (logoImage && placements.includes('cover')) {
    const { w, h } = scaledDims(logoImage.width, logoImage.height, 140, 70);
    page.drawImage(logoImage, {
      x: 15,
      y: height - bannerH + (bannerH - h) / 2,
      width: w,
      height: h,
    });
  }

  // "DOCUMENT TRANSMITTAL" — right-aligned in banner
  const bannerTitle = 'DOCUMENT TRANSMITTAL';
  const titleSize = 13;
  const titleW = helveticaBold.widthOfTextAtSize(bannerTitle, titleSize);
  page.drawText(bannerTitle, {
    x: width - titleW - 20,
    y: height - bannerH / 2 - titleSize / 2,
    size: titleSize,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  // ── Transmittal number + purpose ────────────────────────────────────────────
  let y = height - bannerH - 30;

  page.drawText(data.transmittalNumber, {
    x: 40,
    y,
    size: 22,
    font: helveticaBold,
    color: primaryColor,
  });
  y -= 26;

  const purposeLabel = PURPOSE_LABELS[data.purpose] ?? data.purpose;
  page.drawText(purposeLabel, {
    x: 40,
    y,
    size: 11,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 22;

  // Thin divider
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 18;

  // ── 2-column metadata grid ─────────────────────────────────────────────────
  const col2X = width / 2 + 10;
  const labelColor = rgb(0.5, 0.5, 0.5);
  const valueColor = rgb(0.1, 0.1, 0.1);

  const drawMeta = (
    label: string,
    value: string | null | undefined,
    x: number,
    curY: number
  ) => {
    page.drawText(label.toUpperCase(), {
      x,
      y: curY,
      size: 7.5,
      font: helveticaBold,
      color: labelColor,
    });
    page.drawText(value ?? '—', {
      x,
      y: curY - 12,
      size: 10,
      font: helvetica,
      color: valueColor,
    });
  };

  // Row heights: each meta pair is ~36pt tall
  const metaRowH = 38;

  // Left column
  drawMeta('Project', data.projectName, 40, y);
  drawMeta('Project No', data.projectNumber, 40, y - metaRowH);
  drawMeta('Client', data.clientName, 40, y - metaRowH * 2);
  drawMeta('From', data.fromName, 40, y - metaRowH * 3);

  // Right column
  drawMeta('To (Name)', data.toName, col2X, y);
  drawMeta('To (Email)', data.toEmail, col2X, y - metaRowH);
  drawMeta(
    'Issue Date',
    data.issuedAt.toLocaleDateString('en-GB'),
    col2X,
    y - metaRowH * 2
  );

  y -= metaRowH * 4 + 4;

  // Divider
  page.drawLine({
    start: { x: 40, y },
    end: { x: width - 40, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 18;

  // ── Document table ─────────────────────────────────────────────────────────
  page.drawText('DOCUMENTS TRANSMITTED', {
    x: 40,
    y,
    size: 8,
    font: helveticaBold,
    color: labelColor,
  });
  y -= 14;

  // Column x positions
  const COL_NUM = 40;
  const COL_TITLE = 140;
  const COL_DISC = 360;
  const COL_REV = 460;

  // Table header background
  page.drawRectangle({
    x: 40,
    y: y - 4,
    width: width - 80,
    height: 16,
    color: rgb(0.93, 0.93, 0.93),
  });
  page.drawText('DOC NUMBER', {
    x: COL_NUM,
    y,
    size: 7.5,
    font: helveticaBold,
    color: labelColor,
  });
  page.drawText('TITLE', {
    x: COL_TITLE,
    y,
    size: 7.5,
    font: helveticaBold,
    color: labelColor,
  });
  page.drawText('DISCIPLINE', {
    x: COL_DISC,
    y,
    size: 7.5,
    font: helveticaBold,
    color: labelColor,
  });
  page.drawText('REV', {
    x: COL_REV,
    y,
    size: 7.5,
    font: helveticaBold,
    color: labelColor,
  });
  y -= 18;

  const maxTitlePx = COL_DISC - COL_TITLE - 8;

  for (const doc of data.documents) {
    if (y < 80) break; // Don't overflow — MVP is single-page

    page.drawText(doc.docNumber, {
      x: COL_NUM,
      y,
      size: 9,
      font: helvetica,
      color: valueColor,
    });

    // Truncate title to fit column
    let title = doc.title;
    while (title.length > 1 && helvetica.widthOfTextAtSize(title, 9) > maxTitlePx) {
      title = title.slice(0, -1);
    }
    if (title !== doc.title) title += '…';
    page.drawText(title, {
      x: COL_TITLE,
      y,
      size: 9,
      font: helvetica,
      color: valueColor,
    });

    page.drawText(doc.discipline ?? '—', {
      x: COL_DISC,
      y,
      size: 9,
      font: helvetica,
      color: valueColor,
    });

    page.drawText(doc.revisionAtIssue, {
      x: COL_REV,
      y,
      size: 9,
      font: helveticaBold,
      color: valueColor,
    });

    y -= 16;

    // Row separator
    page.drawLine({
      start: { x: 40, y: y + 12 },
      end: { x: width - 40, y: y + 12 },
      thickness: 0.3,
      color: rgb(0.9, 0.9, 0.9),
    });
  }

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (data.notes && y > 100) {
    y -= 6;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 16;
    page.drawText('NOTES', {
      x: 40,
      y,
      size: 7.5,
      font: helveticaBold,
      color: labelColor,
    });
    y -= 14;
    // Render notes (plain text, truncated to avoid overflow)
    page.drawText(data.notes.slice(0, 400), {
      x: 40,
      y,
      size: 9,
      font: helvetica,
      color: valueColor,
      maxWidth: width - 80,
      lineHeight: 13,
    });
  }

  // ── Footer strip ───────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 8, color: primaryColor });
  page.drawText(
    `${data.transmittalNumber} • ${data.issuedAt.toLocaleDateString('en-GB')}`,
    { x: 40, y: 11, size: 7, font: helvetica, color: rgb(0.5, 0.5, 0.5) }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
