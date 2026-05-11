import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { createUploadConfig } from 'pushduck/server';
import { toNextJsPagesHandler } from 'pushduck/adapters/nextjs-pages';
import { getAuthOptions } from '@/lib/nextAuth';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const { s3 } = createUploadConfig()
  .provider('aws', {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    region: process.env.AWS_S3_REGION!,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
  })
  .paths({
    prefix: 'uploads',
    generateKey: (file, metadata) => {
      const userId = (metadata as { userId?: string }).userId ?? 'anonymous';
      const timestamp = Date.now();
      return `${userId}/${timestamp}/${file.name}`;
    },
  })
  .build();

const uploadRouter = s3.createRouter({
  imageUpload: s3
    .image()
    .maxFileSize('4MB')
    .formats(['jpeg', 'jpg', 'png', 'gif', 'webp'])
    .middleware(async ({ req }) => {
      const apiReq = req as NextApiRequest;
      const fakeRes = {} as NextApiResponse;
      const authOptions = getAuthOptions(apiReq, fakeRes);
      const session = await getServerSession(apiReq, fakeRes, authOptions);
      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }
      return { userId: session.user.id };
    }),
  documentUpload: s3
    .file()
    .maxFileSize('16MB')
    .middleware(async ({ req }) => {
      const apiReq = req as NextApiRequest;
      const fakeRes = {} as NextApiResponse;
      const authOptions = getAuthOptions(apiReq, fakeRes);
      const session = await getServerSession(apiReq, fakeRes, authOptions);
      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }
      return { userId: session.user.id };
    }),
});

export type AppUploadRouter = typeof uploadRouter;

export default toNextJsPagesHandler(uploadRouter.handlers);
