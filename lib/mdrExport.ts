import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

/**
 * Build an Excel workbook containing the full document register for an MDR project.
 * Returns a Buffer of the .xlsx file.
 */
export async function buildRegisterWorkbook(
  mdrProjectId: string
): Promise<Buffer> {
  // Fetch all sections with their linked documents
  const sections = await prisma.mdrSection.findMany({
    where: { mdrProjectId },
    orderBy: { order: 'asc' },
    include: {
      documentLinks: {
        orderBy: { order: 'asc' },
        include: {
          document: true,
        },
      },
    },
  });

  const rows: object[] = [];

  for (const section of sections) {
    for (const link of section.documentLinks) {
      const doc = link.document;
      rows.push({
        Section: section.title,
        'Document Number': doc.docNumber,
        Title: doc.title,
        Discipline: doc.discipline ?? '',
        Revision: doc.revision ?? '',
        Status: doc.status,
        Date: doc.docDate ? doc.docDate.toISOString().split('T')[0] : '',
        'File Size (bytes)': doc.fileSize.toString(),
        'MIME Type': doc.mimeType,
        'Original Filename': doc.originalName,
        'Uploaded At': doc.uploadedAt.toISOString().split('T')[0],
      });
    }
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Document Register');

  // Auto-width columns
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));
  worksheet['!cols'] = colWidths;

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buffer);
}

/**
 * Build a CSV string of the document register.
 */
export async function buildRegisterCsv(
  mdrProjectId: string
): Promise<string> {
  const sections = await prisma.mdrSection.findMany({
    where: { mdrProjectId },
    orderBy: { order: 'asc' },
    include: {
      documentLinks: {
        orderBy: { order: 'asc' },
        include: { document: true },
      },
    },
  });

  const lines: string[] = [
    'Section,Document Number,Title,Discipline,Revision,Status,Date,File Size',
  ];

  for (const section of sections) {
    for (const link of section.documentLinks) {
      const doc = link.document;
      const escape = (v: string) =>
        `"${String(v ?? '').replace(/"/g, '""')}"`;
      lines.push(
        [
          escape(section.title),
          escape(doc.docNumber),
          escape(doc.title),
          escape(doc.discipline ?? ''),
          escape(doc.revision ?? ''),
          escape(doc.status),
          escape(
            doc.docDate ? doc.docDate.toISOString().split('T')[0] : ''
          ),
          escape(doc.fileSize.toString()),
        ].join(',')
      );
    }
  }

  return lines.join('\n');
}
