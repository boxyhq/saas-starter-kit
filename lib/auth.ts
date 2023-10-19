import { compare, hash } from 'bcryptjs';

import env from './env';
import { ApiError } from './errors';
import type { AUTH_PROVIDER } from 'types';
import { passwordPolicies } from './common';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function getAuthProviders() {
  return env.authProviders?.split(',') || [];
}

export function isAuthProviderEnabled(provider: AUTH_PROVIDER) {
  return getAuthProviders().includes(provider);
}

export function authProviderEnabled() {
  return {
    github: isAuthProviderEnabled('github'),
    google: isAuthProviderEnabled('google'),
    email: isAuthProviderEnabled('email'),
    saml: isAuthProviderEnabled('saml'),
    credentials: isAuthProviderEnabled('credentials'),
  };
}

export const validatePasswordPolicy = (password: string) => {
  const { minLength } = passwordPolicies;

  if (password.length < minLength) {
    throw new ApiError(
      422,
      `Password must have at least ${minLength} characters.`
    );
  }

  // TODO: Add more password policies
};
