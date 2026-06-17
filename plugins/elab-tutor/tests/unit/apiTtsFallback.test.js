import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function createRes() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader: vi.fn(function setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    }),
    status: vi.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    send: vi.fn(function send(body) {
      this.body = body;
      return this;
    }),
    json: vi.fn(function json(body) {
      this.body = body;
      return this;
    }),
  };
}

describe('/api/tts Voxtral primary', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('uses Supabase unlim-tts Voxtral before the legacy VPS path', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(new Uint8Array(4096), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Tts-Provider': 'voxtral',
        'X-Tts-Voice': '9234f1b6-766a-485f-acc4-e2cf6dc42327',
      },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../../api/tts.js');
    const res = createRes();
    await handler({ method: 'GET', query: { text: 'Fallback audio' } }, res);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/unlim-tts');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).provider).toBe('voxtral');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('audio/mpeg');
    expect(res.headers['x-tts-provider']).toBe('voxtral');
    expect(res.body.byteLength).toBe(4096);
  });
});
