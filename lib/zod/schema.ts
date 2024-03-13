import { z } from 'zod';
import { isValidDomain, maxLengthPolicies } from '../common';
import { slugify } from '../server-common';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(maxLengthPolicies.apiKeyName),
});

export const deleteApiKeySchema = z.object({
  apiKeyId: z.string(),
});

export const teamSlugSchema = z.object({
  slug: z.string().max(maxLengthPolicies.slug),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(maxLengthPolicies.team),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(maxLengthPolicies.slug)
    .transform((slug) => slugify(slug)),
  domain: z
    .string()
    .max(maxLengthPolicies.domain)
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
    )
    .transform((domain) => {
      if (!domain) {
        return null;
      }

      return domain.trim().toLowerCase();
    }),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(maxLengthPolicies.team),
});

export const updateAccountSchema = z.union([
  z.object({
    email: z
      .string()
      .email('Enter a valid email address')
      .max(maxLengthPolicies.email),
  }),
  z.object({
    name: z.string().min(1, 'Name is required').max(maxLengthPolicies.name),
  }),
  z.object({
    image: z
      .string()
      .url('Enter a valid URL')
      .refine(
        (imageUri) => imageUri.startsWith('data:image/'),
        'Avatar must be an image'
      )
      .refine((imageUri) => {
        const [, base64] = imageUri.split(',');
        const size = base64.length * (3 / 4) - 2;
        return size < 2000000;
      }, 'Avatar must be less than 2MB'),
  }),
]);
