import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const deleteApiKeySchema = z.object({
  apiKeyId: z.string().min(1),
});

export const teamSlugSchema = z.object({
  slug: z.string().min(1),
});
