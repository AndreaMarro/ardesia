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

describe('/api/voxtral proxy', () => {
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

  it('ignores legacy VITE_SUPABASE_EDGE_KEY and uses a valid anon JWT fallback', async () => {
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    process.env.VITE_SUPABASE_EDGE_KEY = 'legacy-invalid-token';

    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array(2048), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Tts-Provider': 'voxtral',
        'X-Tts-Voice': '9234f1b6-766a-485f-acc4-e2cf6dc42327',
      },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../../api/voxtral.js');
    const res = createRes();
    await handler({ method: 'POST', body: { input: 'Ciao Andrea.' } }, res);

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toMatch(/^Bearer eyJ/);
    expect(headers.Authorization).not.toContain('legacy-invalid-token');
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-tts-provider']).toBe('voxtral');
  });

  it('ignores malformed SUPABASE_ANON_KEY env values instead of sending them upstream', async () => {
    process.env.SUPABASE_ANON_KEY = 'legacy-invalid-token';
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array(2048), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Tts-Provider': 'voxtral',
      },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { default: handler } = await import('../../api/voxtral.js');
    const res = createRes();
    await handler({ method: 'POST', body: { input: 'Chiave env sporca.' } }, res);

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toMatch(/^Bearer eyJ/);
    expect(headers.Authorization).not.toContain('legacy-invalid-token');
    expect(res.statusCode).toBe(200);
  });
});
