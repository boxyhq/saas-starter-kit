jest.mock('lib/session', () => ({ getSession: jest.fn() }));
jest.mock('lib/metrics', () => ({ recordMetric: jest.fn() }));
jest.mock('models/user', () => ({ updateUser: jest.fn() }));
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'lib/session';
import { updateUser } from 'models/user';
import handler from 'pages/api/users';

function response() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.resetAllMocks();
  (getSession as jest.Mock).mockResolvedValue({ user: { id: 'local-user' } });
});

it.each([{ name: 'New Name' }, { email: 'new@example.com' }])(
  'rejects Prisma-only profile changes: %p',
  async (body) => {
    const res = response();
    await handler(
      { method: 'PUT', body } as NextApiRequest,
      res as unknown as NextApiResponse
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(updateUser).not.toHaveBeenCalled();
  }
);

it('keeps avatar updates on the local account', async () => {
  const res = response();
  const body = { image: 'data:image/png;base64,iVBORw0KGgo=' };
  await handler(
    { method: 'PUT', body } as NextApiRequest,
    res as unknown as NextApiResponse
  );
  expect(updateUser).toHaveBeenCalledWith({
    where: { id: 'local-user' },
    data: body,
  });
  expect(res.status).toHaveBeenCalledWith(204);
});
