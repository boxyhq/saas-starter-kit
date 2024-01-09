import { z } from 'zod';
import { validateDomain } from '../common';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const deleteApiKeySchema = z.object({
  apiKeyId: z.string(),
});

export const teamSlugSchema = z.object({
  slug: z.string(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  domain: z
    .string()
    .optional()
    .refine(
      (domain) => {
        if (!domain) {
          return true;
        }

        return validateDomain(domain);
      },
      {
        message: 'Enter a domain name in the format example.com',
      }
    ),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});
