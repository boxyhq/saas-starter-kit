import { z } from 'zod';
import { isValidDomain } from '../common';

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

        return isValidDomain(domain);
      },
      {
        message: 'Enter a domain name in the format example.com',
      }
    ),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updateAccountSchema = z.union([
  z.object({ email: z.string().email('Enter a valid email address') }),
  z.object({ name: z.string().min(1, 'Name is required') }),
  z.object({ image: z.string() }),
]);
