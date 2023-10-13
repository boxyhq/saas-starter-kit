import { enc, lib } from 'crypto-js';
import type { NextApiRequest } from 'next';

export const createRandomString = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  let string = '';

  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return string;
};

// Create token
export function generateToken(length = 64) {
  const tokenBytes = lib.WordArray.random(length);

  return enc.Base64.stringify(tokenBytes);
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// Fetch the auth token from the request headers
export const extractAuthToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization || null;

  return authHeader ? authHeader.split(' ')[1] : null;
};

export const domainRegex =
  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;

export const validateDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Password should be at least 8 characters long
  if (password.length < 8) {
    return false;
  }

  // Password should have at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Password should have at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Password should have at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Password should have at least one special character
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return false;
  }

  return true;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const passwordPolicies = {
  minLength: 8,
};
