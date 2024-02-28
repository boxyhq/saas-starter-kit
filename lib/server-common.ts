import { randomBytes } from 'crypto';
import type { NextApiRequest } from 'next';

// Function to force consume the response body to avoid memory leaks
export const forceConsume = async (response) => {
  try {
    await response.text();
  } catch (error) {
    // Do nothing
  }
};

// Create token
export function generateToken(length = 64) {
  const tokenBytes = randomBytes(Math.ceil(length / 2)); // Convert length from bytes to hex

  return tokenBytes.toString('hex').slice(0, length);
}

// Fetch the auth token from the request headers
export const extractAuthToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization || null;

  return authHeader ? authHeader.split(' ')[1] : null;
};

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

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
