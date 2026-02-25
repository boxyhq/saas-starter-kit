import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3';
import { prisma } from './prisma';
import env from './env';

/**
 * Delete an S3 object only if the document has no remaining section references
 * across ALL MDR projects. Safe to call after removing an MdrSectionDocument link.
 */
export async function deleteDocumentIfUnreferenced(
  documentId: string
): Promise<void> {
  const refCount = await prisma.mdrSectionDocument.count({
    where: { documentId },
  });

  if (refCount > 0) return; // still referenced elsewhere

  const doc = await prisma.mdrDocument.findUnique({
    where: { id: documentId },
    select: { s3Key: true, pdfS3Key: true },
  });

  if (!doc) return;

  // Delete both original and converted PDF
  await Promise.allSettled([
    s3Client.send(
      new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: doc.s3Key })
    ),
    doc.pdfS3Key
      ? s3Client.send(
          new DeleteObjectCommand({
            Bucket: env.s3.bucket,
            Key: doc.pdfS3Key,
          })
        )
      : Promise.resolve(),
  ]);
}

/**
 * Move an S3 object to GLACIER_IR storage class.
 * Used when archiving or finalizing MDR compilations.
 */
export async function archiveS3Object(key: string): Promise<void> {
  // Copy to same key with GLACIER_IR storage class (S3 doesn't support direct storage class change)
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: env.s3.bucket,
      CopySource: `${env.s3.bucket}/${key}`,
      Key: key,
      StorageClass: 'GLACIER_IR' as any,
      MetadataDirective: 'COPY',
    })
  );
}

/**
 * Delete all S3 objects for an entire MDR project.
 * Only deletes documents where the section reference count drops to 0
 * (cross-MDR shared docs remain until all references are removed).
 */
export async function deleteProjectS3Objects(
  mdrProjectId: string
): Promise<void> {
  // Get all documents owned by this project
  const documents = await prisma.mdrDocument.findMany({
    where: { mdrProjectId },
    select: { id: true, s3Key: true, pdfS3Key: true },
  });

  // Get all templates
  const templates = await prisma.mdrTemplate.findMany({
    where: { mdrProjectId },
    select: { s3Key: true },
  });

  // Get all compilations
  const compilations = await prisma.mdrCompilation.findMany({
    where: { mdrProjectId },
    select: { s3Key: true },
  });

  const deleteKeys: string[] = [];

  for (const doc of documents) {
    // Check cross-project references
    const refCount = await prisma.mdrSectionDocument.count({
      where: {
        documentId: doc.id,
        section: { mdrProjectId: { not: mdrProjectId } },
      },
    });

    if (refCount === 0) {
      deleteKeys.push(doc.s3Key);
      if (doc.pdfS3Key) deleteKeys.push(doc.pdfS3Key);
    }
  }

  for (const tmpl of templates) {
    deleteKeys.push(tmpl.s3Key);
  }

  for (const comp of compilations) {
    if (comp.s3Key) deleteKeys.push(comp.s3Key);
  }

  await Promise.allSettled(
    deleteKeys.map((key) =>
      s3Client.send(
        new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key })
      )
    )
  );
}
