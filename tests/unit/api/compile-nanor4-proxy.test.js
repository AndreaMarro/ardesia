/**
 * Iter 98 Atom E — api/compile/nanor4.js Vercel serverless proxy tests
 *
 * Verifies the secure cross-compile proxy: method gate, honest 503 when
 * Cloud Compile not configured, input validation, upstream forwarding +
 * server-side API key injection, timeout + error handling.
 *
 * Module reads process.env at load time (const top-of-file) → tests use
 * vi.resetModules() + vi.stubEnv() + dynamic import per env scenario.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function makeRes() {
  const res = {
    statusCode: 0,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    send(payload) { this.body = payload; return this; },
    setHeader(k, v) { this.headers[k] = v; },
  };
  return res;
}

describe('api/compile/nanor4.js — Vercel serverless cross-compile proxy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('method gate', () => {
    it('rejects non-POST with 405', async () => {
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'GET' }, res);
      expect(res.statusCode).toBe(405);
      expect(res.body.error).toBe('method_not_allowed');
      expect(res.headers.Allow).toBe('POST');
    });
  });

  describe('honest 503 when Cloud Compile not configured', () => {
    it('returns 503 cloud_compile_not_configured when ELAB_CLOUD_COMPILE_URL unset', async () => {
      vi.stubEnv('ELAB_CLOUD_COMPILE_URL', '');
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(res.statusCode).toBe(503);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe('cloud_compile_not_configured');
      expect(res.body.message).toMatch(/Render/i);
    });
  });

  describe('input validation (Cloud Compile configured)', () => {
    beforeEach(() => {
      vi.stubEnv('ELAB_CLOUD_COMPILE_URL', 'https://elab-cloud-compile.onrender.com');
      vi.stubEnv('ELAB_CLOUD_COMPILE_API_KEY', 'test-key-123');
    });

    it('rejects missing sketchCode with 400', async () => {
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: {} }, res);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('missing_sketch_code');
    });

    it('rejects empty/whitespace sketchCode with 400', async () => {
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: '   ' } }, res);
      expect(res.statusCode).toBe(400);
    });

    it('rejects sketch >100KB with 413', async () => {
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      const huge = 'a'.repeat(100 * 1024 + 1);
      await handler({ method: 'POST', body: { sketchCode: huge } }, res);
      expect(res.statusCode).toBe(413);
      expect(res.body.error).toBe('sketch_too_large');
    });
  });

  describe('upstream forwarding + server-side API key injection', () => {
    beforeEach(() => {
      vi.stubEnv('ELAB_CLOUD_COMPILE_URL', 'https://elab-cloud-compile.onrender.com');
      vi.stubEnv('ELAB_CLOUD_COMPILE_API_KEY', 'secret-render-key');
    });

    it('forwards to Cloud Render /compile with x-elab-api-key header', async () => {
      let capturedUrl = '';
      let capturedOpts = null;
      vi.stubGlobal('fetch', vi.fn(async (url, opts) => {
        capturedUrl = url;
        capturedOpts = opts;
        return {
          status: 200,
          text: async () => JSON.stringify({ ok: true, hexBase64: 'ABC123', artifactSize: 39048 }),
        };
      }));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({
        method: 'POST',
        body: { sketchCode: 'void setup(){}\nvoid loop(){}', fqbn: 'arduino:renesas_uno:nanor4' },
      }, res);
      expect(capturedUrl).toBe('https://elab-cloud-compile.onrender.com/compile');
      expect(capturedOpts.method).toBe('POST');
      expect(capturedOpts.headers['x-elab-api-key']).toBe('secret-render-key');
      const sentBody = JSON.parse(capturedOpts.body);
      expect(sentBody.sketchCode).toContain('void setup');
      expect(sentBody.fqbn).toBe('arduino:renesas_uno:nanor4');
      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.hexBase64).toBe('ABC123');
    });

    it('defaults fqbn to canonical arduino:renesas_uno:nanor4 when omitted', async () => {
      let sentBody = null;
      vi.stubGlobal('fetch', vi.fn(async (url, opts) => {
        sentBody = JSON.parse(opts.body);
        return { status: 200, text: async () => JSON.stringify({ ok: true }) };
      }));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(sentBody.fqbn).toBe('arduino:renesas_uno:nanor4');
    });

    it('accepts legacy `code` field as sketchCode alias', async () => {
      let sentBody = null;
      vi.stubGlobal('fetch', vi.fn(async (url, opts) => {
        sentBody = JSON.parse(opts.body);
        return { status: 200, text: async () => JSON.stringify({ ok: true }) };
      }));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { code: 'void loop(){}' } }, res);
      expect(sentBody.sketchCode).toBe('void loop(){}');
    });

    it('propagates upstream error status (e.g. 401)', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        status: 401,
        text: async () => JSON.stringify({ ok: false, error: 'api_key_required' }),
      })));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('api_key_required');
    });

    it('handles upstream non-JSON response', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => ({
        status: 502,
        text: async () => '<html>Bad Gateway</html>',
      })));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(res.statusCode).toBe(502);
      expect(res.body.error).toBe('upstream_non_json');
    });

    it('returns 504 on upstream timeout (AbortError)', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        throw err;
      }));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(res.statusCode).toBe(504);
      expect(res.body.error).toBe('cloud_compile_timeout');
    });

    it('returns 500 on generic fetch error', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => {
        throw new Error('network down');
      }));
      vi.resetModules();
      const { default: handler } = await import('../../../api/compile/nanor4.js');
      const res = makeRes();
      await handler({ method: 'POST', body: { sketchCode: 'void setup(){}' } }, res);
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('cloud_compile_proxy_error');
    });
  });
});
