// Unit tests for the provider selection in lib/email/sendEmail.ts.
// nodemailer and the MailKite transport are mocked so we assert wiring, not network.

jest.mock('nodemailer', () => {
  const sendMail = jest.fn(async () => ({ messageId: 'msg_test' }));
  const createTransport = jest.fn(() => ({ sendMail }));
  return {
    __esModule: true,
    default: { createTransport },
    createTransport,
  };
});

jest.mock('nodemailer-mailkite-transport', () => {
  const mailkiteTransport = jest.fn((options?: unknown) => ({
    name: 'mailkite',
    version: '0.1.1',
    options,
  }));
  return {
    __esModule: true,
    default: mailkiteTransport,
    mailkiteTransport,
  };
});

const originalEnv = { ...process.env };

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('sendEmail', () => {
  it('sends through the MailKite transport when MAIL_PROVIDER=mailkite', async () => {
    process.env.MAIL_PROVIDER = 'mailkite';
    process.env.MAILKITE_API_KEY = 'mk_test_123';
    process.env.SMTP_FROM = 'noreply@example.com';

    const { sendEmail } = await import('./sendEmail');
    const { createTransport } = await import('nodemailer');
    const { mailkiteTransport } = await import('nodemailer-mailkite-transport');

    await sendEmail({
      to: 'user@example.com',
      subject: 'Welcome',
      html: '<p>Hi</p>',
    });

    expect(mailkiteTransport).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'mk_test_123' })
    );
    const transport = createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Hi</p>',
      })
    );
  });

  it('passes the custom API base URL when MAILKITE_BASE_URL is set', async () => {
    process.env.MAIL_PROVIDER = 'mailkite';
    process.env.MAILKITE_API_KEY = 'mk_test_123';
    process.env.MAILKITE_BASE_URL = 'https://mailkite.example.test';

    const { sendEmail } = await import('./sendEmail');
    const { mailkiteTransport } = await import('nodemailer-mailkite-transport');

    await sendEmail({ to: 'a@b.test', subject: 's', html: '<p></p>' });

    expect(mailkiteTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'mk_test_123',
        baseUrl: 'https://mailkite.example.test',
      })
    );
  });

  it('no-ops when MAIL_PROVIDER=mailkite but no API key is set (local dev)', async () => {
    process.env.MAIL_PROVIDER = 'mailkite';
    delete process.env.MAILKITE_API_KEY;

    const { sendEmail } = await import('./sendEmail');
    const { createTransport } = await import('nodemailer');
    const { mailkiteTransport } = await import('nodemailer-mailkite-transport');

    await expect(
      sendEmail({ to: 'a@b.test', subject: 's', html: '<p></p>' })
    ).resolves.toBeUndefined();
    expect(mailkiteTransport).not.toHaveBeenCalled();
    const transport = createTransport.mock.results[0]?.value;
    expect(transport?.sendMail).not.toHaveBeenCalled();
  });

  it('uses SMTP and no-ops when SMTP_HOST is not configured (default provider)', async () => {
    delete process.env.MAIL_PROVIDER;
    delete process.env.SMTP_HOST;

    const { sendEmail } = await import('./sendEmail');
    const { createTransport } = await import('nodemailer');

    await expect(
      sendEmail({ to: 'a@b.test', subject: 's', html: '<p></p>' })
    ).resolves.toBeUndefined();
    const transport = createTransport.mock.results[0]?.value;
    expect(transport?.sendMail).not.toHaveBeenCalled();
  });

  it('sends via SMTP when SMTP_HOST is configured (default provider)', async () => {
    delete process.env.MAIL_PROVIDER;
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'u';
    process.env.SMTP_PASSWORD = 'p';
    process.env.SMTP_FROM = 'noreply@example.com';

    const { sendEmail } = await import('./sendEmail');
    const { createTransport } = await import('nodemailer');
    const { mailkiteTransport } = await import('nodemailer-mailkite-transport');

    await sendEmail({ to: 'a@b.test', subject: 's', html: '<p></p>' });

    expect(mailkiteTransport).not.toHaveBeenCalled();
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        auth: { user: 'u', pass: 'p' },
      })
    );
    const transport = createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'noreply@example.com' })
    );
  });
});
