import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import env from './env';

export const s3Client = new S3Client({
  region: env.s3.region,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
});

export async function getPresignedPutUrl(
  key: string,
  mimeType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ContentType: mimeType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedGetUrl(
  key: string,
  filename?: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    ...(filename
      ? {
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
        }
      : {}),
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteS3Object(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key })
  );
}

export async function headS3Object(
  key: string
): Promise<{ contentLength?: number } | null> {
  try {
    const result = await s3Client.send(
      new HeadObjectCommand({ Bucket: env.s3.bucket, Key: key })
    );
    return { contentLength: result.ContentLength };
  } catch {
    return null;
  }
}

export async function copyS3Object(
  sourceKey: string,
  destKey: string,
  storageClass?: string
): Promise<void> {
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: env.s3.bucket,
      CopySource: `${env.s3.bucket}/${sourceKey}`,
      Key: destKey,
      ...(storageClass ? { StorageClass: storageClass as any } : {}),
    })
  );
}

// ─── S3 key generators ────────────────────────────────────────────────────

export function mdrDocumentKey(
  teamId: string,
  mdrId: string,
  sectionId: string,
  docId: string,
  filename: string
): string {
  return `teams/${teamId}/mdr/${mdrId}/sections/${sectionId}/documents/${docId}/${filename}`;
}

export function mdrDocumentKeyUnsectioned(
  teamId: string,
  mdrId: string,
  docId: string,
  filename: string
): string {
  return `teams/${teamId}/mdr/${mdrId}/documents/${docId}/${filename}`;
}

export function mdrTemplateKey(
  teamId: string,
  mdrId: string,
  templateId: string,
  filename: string
): string {
  return `teams/${teamId}/mdr/${mdrId}/templates/${templateId}/${filename}`;
}

export function mdrCompilationKey(
  teamId: string,
  mdrId: string,
  compilationId: string
): string {
  return `teams/${teamId}/mdr/${mdrId}/compilations/${compilationId}/mdr.pdf`;
}

export function mdrInboxAttachmentKey(
  teamId: string,
  inboxId: string,
  emailId: string,
  filename: string
): string {
  return `teams/${teamId}/inboxes/${inboxId}/emails/${emailId}/${filename}`;
}

export function mdrLogoKey(teamId: string, filename: string): string {
  return `teams/${teamId}/branding/logo/${filename}`;
}

export function mdrTransmittalCoverSheetKey(
  teamId: string,
  mdrId: string,
  transmittalId: string
): string {
  return `teams/${teamId}/mdr/${mdrId}/transmittals/${transmittalId}/cover-sheet.pdf`;
}

export function mediaAssetKey(assetId: string, filename: string): string {
  return `media/${assetId}/${filename}`;
}
