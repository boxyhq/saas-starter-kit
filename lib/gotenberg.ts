import env from './env';

/**
 * Convert a file (DOCX, XLSX, etc.) to PDF using Gotenberg.
 *
 * Gotenberg must be running at GOTENBERG_URL (default http://localhost:3001).
 * Start with: docker run -d -p 3001:3000 gotenberg/gotenberg:8
 */
export async function convertToPdf(
  buffer: Buffer,
  filename: string
): Promise<Buffer> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
  formData.append('files', blob, filename);

  const response = await fetch(
    `${env.gotenberg.url}/forms/libreoffice/convert`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gotenberg conversion failed (${response.status}): ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Check whether a MIME type is convertible to PDF by Gotenberg.
 */
export function isConvertibleMimeType(mimeType: string): boolean {
  const convertible = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/msword', // doc
    'application/vnd.ms-excel', // xls
    'application/vnd.ms-powerpoint', // ppt
    'application/rtf',
    'text/plain',
    'text/html',
    'application/odt',
    'application/ods',
    'application/odp',
  ];
  return convertible.includes(mimeType);
}
