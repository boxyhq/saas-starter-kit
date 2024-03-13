import { z } from 'zod';
import { isValidDomain, maxLengthPolicies, passwordPolicies } from '../common';
import { slugify } from '../server-common';
import { Role } from '@prisma/client';

const password = z
  .string()
  .max(
    maxLengthPolicies.password,
    `Password should have at most ${maxLengthPolicies.password} characters`
  )
  .min(
    passwordPolicies.minLength,
    `Password must have at least ${passwordPolicies.minLength} characters`
  );

const email = z
  .string()
  .email('Enter a valid email address')
  .max(
    maxLengthPolicies.email,
    `Email should have at most ${maxLengthPolicies.email} characters`
  );

const teamName = z
  .string()
  .min(1, 'Name is required')
  .max(
    maxLengthPolicies.team,
    `Team name should have at most ${maxLengthPolicies.team} characters`
  );

const name = z
  .string()
  .min(1, 'Name is required')
  .max(
    maxLengthPolicies.name,
    `Name should have at most ${maxLengthPolicies.name} characters`
  );

const slug = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(
    maxLengthPolicies.slug,
    `Slug should have at most ${maxLengthPolicies.slug} characters`
  );

const image = z
  .string()
  .url('Enter a valid URL')
  .refine(
    (imageUri) => imageUri.startsWith('data:image/'),
    'Avatar must be an image'
  )
  .refine((imageUri) => {
    const [, base64] = imageUri.split(',');
    if (!base64) {
      return false;
    }
    const size = base64.length * (3 / 4) - 2;
    return size < 2000000;
  }, 'Avatar must be less than 2MB');

const domain = z
  .string()
  .max(
    maxLengthPolicies.domain,
    `Domain should have at most ${maxLengthPolicies.domain} characters`
  )
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
  });

export const createApiKeySchema = z.object({
  name: teamName,
});

export const deleteApiKeySchema = z.object({
  apiKeyId: z.string(),
});

export const teamSlugSchema = z.object({
  slug,
});

export const updateTeamSchema = z.object({
  name: teamName,
  slug: slug.transform((slug) => slugify(slug)),
  domain,
});

export const createTeamSchema = z.object({
  name: teamName,
});

export const updateAccountSchema = z.union([
  z.object({
    email,
  }),
  z.object({
    name,
  }),
  z.object({
    image,
  }),
]);

export const updatePasswordSchema = z.object({
  currentPassword: password,
  newPassword: password,
});

export const userJoinSchema = z.union([
  z.object({
    team: teamName,
    slug,
  }),
  z.object({
    name,
    email,
    password,
  }),
]);

export const resetPasswordSchema = z.object({
  password,
  token: z.string({
    required_error: 'Token is required',
    invalid_type_error: 'Token must be a string',
  }),
});

export const inviteViaEmailSchema = z.union([
  z.object({
    email,
    role: z.nativeEnum(Role),
  }),
  z.object({
    role: z.nativeEnum(Role),
    domains: z
      .string()
      .optional()
      .refine(
        (domains) => (domains ? domains.split(',').every(isValidDomain) : true),
        'Invalid domain in the list'
      ),
  }),
]);

export const resendLinkRequestSchema = z.object({
  email,
  expiredToken: z.string({
    required_error: 'Expired token is required',
    invalid_type_error: 'Expired token must be a string',
  }),
});

export const deleteSessionSchema = z.object({
  id: z.string({
    required_error: 'Session id is required',
    invalid_type_error: 'Session id must be a string',
  }),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resendEmailToken = z.object({
  email,
});

export const checkoutSessionSchema = z.object({
  priceId: z.string({
    required_error: 'PriceId is required',
    invalid_type_error: 'PriceId must be a string',
  }),
  quantity: z.number().optional(),
});
