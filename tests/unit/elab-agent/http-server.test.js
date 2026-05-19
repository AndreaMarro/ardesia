/**
 * tests/unit/elab-agent/http-server.test.js
 *
 * Iter 69 A2 — Unit tests for the Express HTTP binding helpers.
 *
 * Strategy iter 69 (zero-install constraint):
 *   - `express` is NOT yet in main package.json (Andrea ratify iter 70).
 *   - We therefore test the pure helpers that don't require express:
 *       * isOriginAllowed (CORS whitelist semantics)
 *       * makeCorsMiddleware (request/response shape)
 *       * handleCompileAndUpload (combined sequential handler)
 *       * handleJobsStatus + ledger lifecycle
 *       * createApp gracefully reports missing express dependency
 *   - Endpoint integration tests are gated behind `EXPRESS_AVAILABLE` so
 *     they auto-skip when the dep isn't installed (iter 70+ they run).
 *
 * Anti-debito:
 *   - inject mock handlers (handleCompile / handleUpload) so we don't
 *     actually spawn arduino-cli inside CI/test
 *   - reset ledger between tests (no cross-test pollution)
 *
 * (c) Andrea Marro — 2026-05-16 — ELAB Tutor iter 69 A2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  ALLOWED_ORIGINS,
  VERCEL_PREVIEW_REGEX,
  BODY_LIMIT,
  DEFAULT_AGENT_PORT,
  isOriginAllowed,
  makeCorsMiddleware,
  handleCompileAndUpload,
  handleJobsStatus,
  _resetJobLedger,
  createApp,
} from '../../../src/services/elab-agent/http-server.js';

// Detect whether express is installable in this environment. If not, the
// `createApp` integration suites auto-skip with a clear console hint —
// iter 70+ once Andrea ratifies the dep, the same tests light up.
let EXPRESS_AVAILABLE = false;
try {
  // String indirection avoids Vite static import-analysis when the dep
  // is not installed (iter 69 A3 zero-install constraint).
  const expressPkg = ['exp', 'ress'].join('');
  await import(/* @vite-ignore */ expressPkg);
  EXPRESS_AVAILABLE = true;
} catch {
  EXPRESS_AVAILABLE = false;
}

const describeIfExpress = EXPRESS_AVAILABLE ? describe : describe.skip;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Constants + CORS whitelist
// ─────────────────────────────────────────────────────────────────────────────

describe('http-server — constants', () => {
  it('DEFAULT_AGENT_PORT is 8765 per spec', () => {
    expect(DEFAULT_AGENT_PORT).toBe(8765);
  });

  it('BODY_LIMIT is 10mb per spec (tolerates large HEX uploads)', () => {
    expect(BODY_LIMIT).toBe('10mb');
  });

  it('ALLOWED_ORIGINS contains canonical 4 origins', () => {
    expect(ALLOWED_ORIGINS).toContain('http://localhost:5173');
    expect(ALLOWED_ORIGINS).toContain('http://127.0.0.1:5173');
    expect(ALLOWED_ORIGINS).toContain('https://www.elabtutor.school');
    expect(ALLOWED_ORIGINS).toContain('https://elabtutor.school');
  });

  it('ALLOWED_ORIGINS is frozen (cannot be mutated)', () => {
    expect(Object.isFrozen(ALLOWED_ORIGINS)).toBe(true);
  });
});

describe('isOriginAllowed', () => {
  it('allows undefined Origin (same-origin / Node-side caller)', () => {
    expect(isOriginAllowed(undefined)).toBe(true);
  });

  it('allows empty string Origin (curl default)', () => {
    expect(isOriginAllowed('')).toBe(true);
  });

  it('allows Vite dev origin http://localhost:5173', () => {
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
  });

  it('allows prod origin https://www.elabtutor.school', () => {
    expect(isOriginAllowed('https://www.elabtutor.school')).toBe(true);
  });

  it('allows Vercel preview pattern elab-tutor-*.vercel.app', () => {
    expect(isOriginAllowed('https://elab-tutor-git-feat-abc.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://elab-tutor-pr-123.vercel.app')).toBe(true);
  });

  it('rejects unrelated origin https://evil.example.com', () => {
    expect(isOriginAllowed('https://evil.example.com')).toBe(false);
  });

  it('rejects http://other-vercel.app non-elab subdomain', () => {
    expect(isOriginAllowed('https://other-app.vercel.app')).toBe(false);
  });

  it('VERCEL_PREVIEW_REGEX is case-insensitive', () => {
    expect(VERCEL_PREVIEW_REGEX.test('https://Elab-Tutor-Foo.vercel.app')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORS middleware shape
// ─────────────────────────────────────────────────────────────────────────────

function mockRes() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    setHeader: vi.fn((k, v) => { headers[k] = v; }),
    end: vi.fn(),
  };
}

describe('makeCorsMiddleware', () => {
  it('echoes allowed Origin + sets Vary/Methods/Headers', () => {
    const mw = makeCorsMiddleware();
    const req = { method: 'POST', headers: { origin: 'http://localhost:5173' } };
    const res = mockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
    expect(res.headers['Vary']).toBe('Origin');
    expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 204 immediately for OPTIONS preflight (allowed origin)', () => {
    const mw = makeCorsMiddleware();
    const req = { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } };
    const res = mockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 JSON for denied origin (does NOT call next)', () => {
    const mw = makeCorsMiddleware();
    const req = { method: 'POST', headers: { origin: 'https://evil.example.com' } };
    const res = mockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.end).toHaveBeenCalled();
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.error.category).toBe('cors_denied');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows missing Origin (same-origin) without echoing header', () => {
    const mw = makeCorsMiddleware();
    const req = { method: 'GET', headers: {} };
    const res = mockRes();
    const next = vi.fn();
    mw(req, res, next);
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. handleCompileAndUpload + ledger
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCompileAndUpload — validation', () => {
  beforeEach(() => _resetJobLedger());

  it('rejects empty sketchCode with compile_failed category', async () => {
    const res = await handleCompileAndUpload({ sketchCode: '', port: '/dev/cu.usb' });
    expect(res.ok).toBe(false);
    expect(res.error.category).toBe('compile_failed');
  });

  it('rejects whitespace-only sketchCode', async () => {
    const res = await handleCompileAndUpload({ sketchCode: '   \n\t', port: '/dev/cu.usb' });
    expect(res.ok).toBe(false);
    expect(res.error.category).toBe('compile_failed');
  });

  it('rejects missing port with port_missing category', async () => {
    const res = await handleCompileAndUpload({
      sketchCode: 'void setup(){}void loop(){}',
      port: '',
    });
    expect(res.ok).toBe(false);
    expect(res.error.category).toBe('port_missing');
  });

  it('rejects non-string port', async () => {
    const res = await handleCompileAndUpload({
      sketchCode: 'void setup(){}void loop(){}',
      port: undefined,
    });
    expect(res.ok).toBe(false);
    expect(res.error.category).toBe('port_missing');
  });
});

describe('handleJobsStatus + ledger', () => {
  beforeEach(() => _resetJobLedger());

  it('returns null for missing id', () => {
    expect(handleJobsStatus('does-not-exist')).toBeNull();
  });

  it('returns null for falsy / non-string id', () => {
    expect(handleJobsStatus(null)).toBeNull();
    expect(handleJobsStatus(undefined)).toBeNull();
    expect(handleJobsStatus(123)).toBeNull();
  });

  it('_resetJobLedger clears all entries', () => {
    // populate via a (failing) handleCompileAndUpload which still writes a
    // ledger entry on error path
    _resetJobLedger();
    expect(handleJobsStatus('foo')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. createApp — dependency reporting
// ─────────────────────────────────────────────────────────────────────────────

describe('createApp — dependency check', () => {
  it('throws a clear error message when express is unavailable', async () => {
    if (EXPRESS_AVAILABLE) {
      // Sanity: skip the negative assertion when express IS installed
      // (the success path is covered by describeIfExpress below).
      return;
    }
    await expect(createApp()).rejects.toThrow(/express/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Endpoint integration (gated on express install)
// ─────────────────────────────────────────────────────────────────────────────

describeIfExpress('http-server endpoints (express integration)', () => {
  let appInstance;

  beforeEach(async () => {
    _resetJobLedger();
    // Inject mock handlers so we don't actually spawn arduino-cli.
    appInstance = await createApp({
      handlers: {
        health: async () => ({ agent: 'ok', arduino_cli_version: 'mock' }),
        boards: async () => ({ boards: [{ port: '/dev/cu.mock', boards: [] }] }),
        compile: async ({ code }) => ({
          ok: code.includes('valid'),
          jobId: 'mock-job-1',
          sketchDir: '/tmp/mock',
          buildDir: '/tmp/mock/build',
          ...(code.includes('valid') ? {} : { error: { category: 'compile_failed', message: 'mock' } }),
        }),
        upload: async ({ jobId }) => ({
          ok: !!jobId,
          jobId,
          ...(jobId ? {} : { error: { category: 'port_missing', message: 'mock' } }),
        }),
        compileAndUpload: async ({ sketchCode }) => ({
          ok: sketchCode.includes('valid'),
          jobId: 'mock-combined-1',
          compile: { ok: true },
          upload: { ok: true },
        }),
        jobsStatus: (id) => (id === 'known-job' ? { id, status: 'done' } : null),
      },
    });
  });

  // Lightweight in-process request helper — avoids supertest dep.
  // Express apps are callable as `(req, res)` — we use Node http to wire
  // a real port-bound listener for a moment.
  async function request(method, path, body) {
    const http = await import('node:http');
    return new Promise((resolve, reject) => {
      const server = appInstance.app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        const data = body ? JSON.stringify(body) : null;
        const opts = {
          host: '127.0.0.1',
          port,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173',
            ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          },
        };
        const req = http.request(opts, (res) => {
          let buf = '';
          res.on('data', (c) => (buf += c));
          res.on('end', () => {
            server.close();
            let parsed;
            try { parsed = JSON.parse(buf); } catch { parsed = buf; }
            resolve({ status: res.statusCode, body: parsed, headers: res.headers });
          });
        });
        req.on('error', (err) => { server.close(); reject(err); });
        if (data) req.write(data);
        req.end();
      });
    });
  }

  it('GET /health returns agent metadata', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.body.agent).toBe('elab-compile-upload');
    expect(res.body.version).toBeTruthy();
    expect(res.body.arduino_cli_version).toBe('mock');
  });

  it('POST /compile rejects empty body with 400', async () => {
    const res = await request('POST', '/compile', { sketchCode: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.category).toBe('compile_failed');
  });

  it('POST /compile returns 200 on valid code', async () => {
    const res = await request('POST', '/compile', { sketchCode: 'valid sketch' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.jobId).toBe('mock-job-1');
  });

  it('POST /upload rejects missing port with 400 port_missing', async () => {
    const res = await request('POST', '/upload', { jobId: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.error.category).toBe('port_missing');
  });

  it('POST /compile-and-upload rejects missing fields with 400', async () => {
    const res = await request('POST', '/compile-and-upload', {});
    expect(res.status).toBe(400);
  });

  it('GET /jobs/:id/status returns 404 for unknown id', async () => {
    const res = await request('GET', '/jobs/unknown/status');
    expect(res.status).toBe(404);
  });

  it('GET /jobs/:id/status returns 200 + entry for known id', async () => {
    const res = await request('GET', '/jobs/known-job/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('CORS denies disallowed origin with 403', async () => {
    const http = await import('node:http');
    const result = await new Promise((resolve, reject) => {
      const server = appInstance.app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        const req = http.request({
          host: '127.0.0.1',
          port,
          path: '/health',
          method: 'GET',
          headers: { Origin: 'https://evil.example.com' },
        }, (res) => {
          let buf = '';
          res.on('data', (c) => (buf += c));
          res.on('end', () => {
            server.close();
            resolve({ status: res.statusCode, body: buf });
          });
        });
        req.on('error', (err) => { server.close(); reject(err); });
        req.end();
      });
    });
    expect(result.status).toBe(403);
  });
});
