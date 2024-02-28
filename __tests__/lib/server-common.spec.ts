import type { NextApiRequest } from 'next';

import { extractAuthToken, generateToken } from '../../lib/server-common';

describe('Lib - server-common', () => {
  describe('Random string', () => {
    it('should create a random string with default length 6', () => {
      const result = generateToken();
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should create a random string with random length', () => {
      const length = Math.round(Math.random() * 10) + 1;
      const result = generateToken(length);
      expect(result).toBeTruthy();
      expect(result.length).toBe(length);
    });
  });

  describe('extractAuthToken', () => {
    it('should return a token for a bearer token', () => {
      const token = generateToken(10);
      const mock = {
        headers: { authorization: `Bearer ${token}` },
      } as NextApiRequest;
      const result = extractAuthToken(mock);
      expect(result).toBe(token);
    });

    it('should return null when token is empty', () => {
      const mock = { headers: { authorization: '' } } as NextApiRequest;
      const result = extractAuthToken(mock);
      expect(result).toBeNull();
    });
  });
});
