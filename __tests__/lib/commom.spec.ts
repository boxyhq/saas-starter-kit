import type { NextApiRequest } from 'next';

import { createRandomString, extractAuthToken } from '../../lib/common';

describe('Lib - commom', () => {
  describe('Random string', () => {
    it('should create a random string with default length 6', () => {
      const result = createRandomString();
      expect(result).toBeTruthy();
      expect(result.length).toBe(6);
    });

    it('should create a random string with random length', () => {
      const length = Math.round(Math.random() * 10);
      const result = createRandomString(length);
      expect(result).toBeTruthy();
      expect(result.length).toBe(length);
    });
  });

  describe('extractAuthToken', () => {
    it('should return a token for a bearer token', () => {
      const token = createRandomString(10);
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
