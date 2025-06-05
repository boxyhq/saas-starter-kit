
/** @jest-environment node */
import puppeteer from 'puppeteer';

jest.mock('puppeteer');

const supabaseMock = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      })),
    })),
  })),
};

jest.mock('../../lib/supabase', () => ({ __esModule: true, default: supabaseMock }));

describe('API - scan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 on success', async () => {
    const browserMock = {
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn(),
        evaluate: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true),
        $: jest.fn().mockResolvedValue(null),
      }),
      close: jest.fn(),
    };
    (puppeteer.launch as jest.Mock).mockResolvedValue(browserMock);

    const { POST } = await import('../../app/api/scan/route');
    const req = {
      json: () => Promise.resolve({ url: 'http://test.com', user_id: '1', pro: false }),
    } as any;
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(supabaseMock.from).toHaveBeenCalledWith('scans');
  });

  it('returns 400 when missing params', async () => {
    const { POST } = await import('../../app/api/scan/route');
    const req = { json: () => Promise.resolve({ url: '', user_id: '' }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when supabase not configured', async () => {
    jest.resetModules();
    jest.doMock('../../lib/supabase', () => ({ __esModule: true, default: null }));
    const { POST } = await import('../../app/api/scan/route');
    const req = { json: () => Promise.resolve({ url: 'http://test.com', user_id: '1' }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
