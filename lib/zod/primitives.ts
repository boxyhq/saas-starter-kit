import { z } from 'zod';
import { isValidDomain, maxLengthPolicies, passwordPolicies } from '../common';
import { Role } from '@prisma/client';

export const password = z
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

export const email = z
  .string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  })
  .email('Enter a valid email address')
  .max(
    maxLengthPolicies.email,
    `Email should have at most ${maxLengthPolicies.email} characters`
  );

export const teamName = z
  .string({
    required_error: 'Team name is required',
    invalid_type_error: 'Team name must be a string',
  })
  .min(1, 'Team Name is required')
  .max(
    maxLengthPolicies.team,
    `Team name should have at most ${maxLengthPolicies.team} characters`
  );

export const name = (length: number = maxLengthPolicies.name) =>
  z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(1, 'Name is required')
    .max(length, `Name should have at most ${length} characters`);

export const slug = z
  .string({
    required_error: 'Slug is required',
    invalid_type_error: 'Slug must be a string',
  })
  .min(3, 'Slug must be at least 3 characters')
  .max(
    maxLengthPolicies.slug,
    `Slug should have at most ${maxLengthPolicies.slug} characters`
  );

export const image = z
  .string({
    required_error: 'Avatar is required',
    invalid_type_error: 'Avatar must be a string',
  })
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

export const domain = z
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

export const apiKeyId = z
  .string({
    required_error: 'API key is required',
    invalid_type_error: 'API key must be a string',
  })
  .min(1, 'API key is required');

export const token = z
  .string({
    required_error: 'Token is required',
    invalid_type_error: 'Token must be a string',
  })
  .min(1, 'Token is required');

export const role = z.nativeEnum(Role, {
  required_error: 'Role is required',
  invalid_type_error: 'Role must be a string',
});

export const sentViaEmail = z
  .boolean({
    invalid_type_error: 'Sent via email must be a boolean',
  })
  .default(false);

export const domains = z
  .string({
    invalid_type_error: 'Domains must be a string',
  })
  .optional()
  .refine(
    (domains) => (domains ? domains.split(',').every(isValidDomain) : true),
    'Invalid domain in the list'
  );

export const expiredToken = z
  .string({
    required_error: 'Expired token is required',
    invalid_type_error: 'Expired token must be a string',
  })
  .min(1, 'Expired token is required')
  .max(
    maxLengthPolicies.expiredToken,
    `Expired token should have at most ${maxLengthPolicies.expiredToken} characters`
  );

export const sessionId = z
  .string({
    required_error: 'Session id is required',
    invalid_type_error: 'Session id must be a string',
  })
  .min(1, 'Session id is required');

export const priceId = z
  .string({
    required_error: 'Price Id is required',
    invalid_type_error: 'Price Id must be a string',
  })
  .min(1, 'PriceId is required');

export const quantity = z.number({
  invalid_type_error: 'Quantity must be a number',
});

export const recaptchaToken = z.string({
  invalid_type_error: 'Recaptcha token must be a string',
});

export const sentViaEmailString = z
  .string()
  .max(
    maxLengthPolicies.sendViaEmail,
    `Send via email should be at most ${maxLengthPolicies.sendViaEmail} characters`
  )
  .refine((value) => value === 'true' || !value || value === 'false', {
    message: 'sentViaEmail must be a string "true" or "false" or empty',
  });

export const invitationId = z
  .string({
    required_error: 'Invitation id is required',
    invalid_type_error: 'Invitation id must be a string',
  })
  .min(1, 'Invitation id is required')
  .max(
    maxLengthPolicies.invitationId,
    `Invitation id should be at most ${maxLengthPolicies.invitationId} characters`
  );

export const endpointId = z
  .string({
    required_error: 'Endpoint id is required',
    invalid_type_error: 'Endpoint id must be a string',
  })
  .min(1, `Endpoint id is required`)
  .max(
    maxLengthPolicies.endpointId,
    `Endpoint id should be at most ${maxLengthPolicies.endpointId} characters`
  );

export const eventTypes = z
  .array(
    z
      .string({
        invalid_type_error: 'Event type must be a string',
        required_error: 'Event type is required',
      })
      .min(1)
      .max(
        maxLengthPolicies.eventType,
        `Event type should be at most ${maxLengthPolicies.eventType} characters`
      )
  )
  .min(1, 'At least one event type is required')
  .max(maxLengthPolicies.eventTypes, 'Too many event types');

export const url = z
  .string({
    invalid_type_error: 'URL must be a string',
  })
  .url('Enter a valid URL')
  .min(1, 'URL is required')
  .max(
    maxLengthPolicies.domain,
    `URL should have at most ${maxLengthPolicies.domain} characters`
  )
  .refine((url) => {
    if (url) {
      if (url.startsWith('https://') || url.startsWith('http://')) {
        return true;
      }
    }
    return false;
  });

export const inviteToken = z
  .string({
    required_error: 'Invite token is required',
    invalid_type_error: 'Invite token must be a string',
  })
  .min(1, 'Invite token is required')
  .max(
    maxLengthPolicies.inviteToken,
    `Invite token should be at most ${maxLengthPolicies.inviteToken} characters`
  );

export const memberId = z
  .string({
    required_error: 'Member id is required',
    invalid_type_error: 'Member id must be a string',
  })
  .min(1)
  .max(
    maxLengthPolicies.memberId,
    `Member id should be at most ${maxLengthPolicies.memberId} characters`
  );
