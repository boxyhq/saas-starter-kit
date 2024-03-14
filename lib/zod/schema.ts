import { z } from 'zod';
import { isValidDomain, maxLengthPolicies, passwordPolicies } from '../common';
import { slugify } from '../server-common';
import { Role } from '@prisma/client';

const password = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
  .max(
    maxLengthPolicies.password,
    `Password should have at most ${maxLengthPolicies.password} characters`
  )
  .min(
    passwordPolicies.minLength,
    `Password must have at least ${passwordPolicies.minLength} characters`
  );

const email = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
  .email('Enter a valid email address')
  .max(
    maxLengthPolicies.email,
    `Email should have at most ${maxLengthPolicies.email} characters`
  );

const teamName = z
  .string({
    required_error: 'Team name is required',
    invalid_type_error: 'Team name must be a string',
  })
  .min(1, 'Team Name is required')
  .max(
    maxLengthPolicies.team,
    `Team name should have at most ${maxLengthPolicies.team} characters`
  );

const name = z
  .string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  })
  .min(1, 'Name is required')
  .max(
    maxLengthPolicies.name,
    `Name should have at most ${maxLengthPolicies.name} characters`
  );

const slug = z
  .string({
    required_error: 'Slug is required',
    invalid_type_error: 'Slug must be a string',
  })
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
  .string({
    invalid_type_error: 'Domain must be a string',
  })
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

const apiKeyId = z
  .string({
    required_error: 'API key is required',
    invalid_type_error: 'API key must be a string',
  })
  .min(1, 'API key is required');

const token = z
  .string({
    required_error: 'Token is required',
    invalid_type_error: 'Token must be a string',
  })
  .min(1, 'Token is required');

const role = z.nativeEnum(Role, {
  required_error: 'Role is required',
  invalid_type_error: 'Role must be a string',
});

const sentViaEmail = z
  .boolean({
    invalid_type_error: 'Sent via email must be a boolean',
  })
  .default(false);

const domains = z
  .string({
    invalid_type_error: 'Domains must be a string',
  })
  .optional()
  .refine(
    (domains) => (domains ? domains.split(',').every(isValidDomain) : true),
    'Invalid domain in the list'
  );

const expiredToken = z
  .string({
    required_error: 'Expired token is required',
    invalid_type_error: 'Expired token must be a string',
  })
  .min(1, 'Expired token is required');

const sessionId = z
  .string({
    required_error: 'Session id is required',
    invalid_type_error: 'Session id must be a string',
  })
  .min(1, 'Session id is required');

const priceId = z
  .string({
    required_error: 'Price Id is required',
    invalid_type_error: 'Price Id must be a string',
  })
  .min(1, 'PriceId is required');

const quantity = z.number({
  invalid_type_error: 'Quantity must be a number',
});

const recaptchaToken = z.string({
  invalid_type_error: 'Recaptcha token must be a string',
});

export const createApiKeySchema = z.object({
  name: teamName,
});

export const deleteApiKeySchema = z.object({
  apiKeyId,
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
  token,
});

export const inviteViaEmailSchema = z.union([
  z.object({
    email,
    role,
    sentViaEmail,
  }),
  z.object({
    role,
    sentViaEmail,
    domains,
  }),
]);

export const resendLinkRequestSchema = z.object({
  email,
  expiredToken,
});

export const deleteSessionSchema = z.object({
  id: sessionId,
});

export const forgotPasswordSchema = z.object({
  email,
  recaptchaToken: recaptchaToken.optional(),
});

export const resendEmailToken = z.object({
  email,
});

export const checkoutSessionSchema = z.object({
  price: priceId,
  quantity: quantity.optional(),
});
