/** @jest-environment node */
import { GET } from '../../app/api/pdf/route';

describe('API - pdf', () => {
  it('returns a pdf response', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.length).toBeGreaterThan(0);
  });
});
