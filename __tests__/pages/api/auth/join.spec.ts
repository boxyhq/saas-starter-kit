import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../../../lib/email/sendVerificationEmail', () => ({
  sendVerificationEmail: jest.fn(),
}));
jest.mock('../../../../models/user', () => ({}));
jest.mock('../../../../models/team', () => ({}));
jest.mock('../../../../models/invitation', () => ({}));
jest.mock('../../../../lib/recaptcha', () => ({
  validateRecaptcha: jest.fn(),
}));
jest.mock('../../../../lib/metrics', () => ({ recordMetric: jest.fn() }));
jest.mock('../../../../lib/slack', () => ({
  slackNotify: () => ({ alert: jest.fn() }),
}));
jest.mock('../../../../models/verificationToken', () => ({}));

describe('API - join', () => {
  it('returns 422 when body is malformed', async () => {
    const handler = (await import('../../../../pages/api/auth/join')).default;
    const req = {
      method: 'POST',
      body: { email: 'invalid' },
    } as unknown as NextApiRequest;
    const json = jest.fn();
    const status = jest.fn().mockReturnThis();
    const res = { status, json } as unknown as NextApiResponse;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(422);
    expect(json.mock.calls[0][0].error.message).toContain('Validation Error');
  });
});
