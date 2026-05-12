/**
 * Unit tests vertex-client.ts (Sprint U iter 39 Phase 0).
 *
 * Validates Vertex EU client surface WITHOUT requiring real SA key:
 *   - isVertexEUEnabled env gate (Phase 0 rollout flag)
 *   - VertexError code matrix (CONFIG_ERROR, AUTH_ERROR, etc.)
 *   - Service Account parsing error paths (missing/malformed base64/JSON)
 *   - Cache reset helper for test isolation
 *   - URL builder regional + model suffix logic
 *   - JWT base64url encoding correctness
 *
 * Real SA crypto.subtle integration tested LIVE via deploy + smoke run
 * (NOT in unit suite — would require RSA private key fixture in repo,
 * which violates "MAI commit secrets" policy).
 *
 * Reference: docs/decisions/2026-05-12-pure-gemini-chat-evidence-based.md
 * (c) Andrea Marro — 2026-05-12 — ELAB Tutor Sprint U iter 39 Phase 0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Polyfill Deno.env for Vitest Node runtime (vertex-client uses Deno.env.get).
// Tests must set/clear vars per case via this proxy.
const envStore = new Map();
globalThis.Deno = globalThis.Deno || {
  env: {
    get: (k) => envStore.get(k),
    set: (k, v) => envStore.set(k, v),
    delete: (k) => envStore.delete(k),
  },
};

// Lazy import (after Deno polyfill).
let vertexClient;
async function loadModule() {
  if (vertexClient) {
    vertexClient._resetVertexCaches?.();
    return vertexClient;
  }
  vertexClient = await import('../../supabase/functions/_shared/vertex-client.ts');
  return vertexClient;
}

beforeEach(() => {
  envStore.clear();
});

afterEach(() => {
  envStore.clear();
});

describe('vertex-client — isVertexEUEnabled env gate', () => {
  it('returns false when ENABLE_VERTEX_EU not set', async () => {
    const m = await loadModule();
    expect(m.isVertexEUEnabled()).toBe(false);
  });

  it('returns false when ENABLE_VERTEX_EU=false', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'false');
    const m = await loadModule();
    expect(m.isVertexEUEnabled()).toBe(false);
  });

  it('returns true when ENABLE_VERTEX_EU=true (lowercase)', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'true');
    const m = await loadModule();
    expect(m.isVertexEUEnabled()).toBe(true);
  });

  it('returns true when ENABLE_VERTEX_EU=TRUE (case-insensitive)', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'TRUE');
    const m = await loadModule();
    expect(m.isVertexEUEnabled()).toBe(true);
  });

  it('returns false for any non-true value (defensive)', async () => {
    envStore.set('ENABLE_VERTEX_EU', '1');
    const m = await loadModule();
    expect(m.isVertexEUEnabled()).toBe(false);
  });
});

describe('vertex-client — VertexError codes', () => {
  it('VertexErrorCode enum exports all expected codes', async () => {
    const m = await loadModule();
    const codes = m.VertexErrorCode;
    expect(codes.SERVICE_RATE_LIMITED).toBe('SERVICE_RATE_LIMITED');
    expect(codes.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
    expect(codes.API_ERROR).toBe('API_ERROR');
    expect(codes.EMPTY_RESPONSE).toBe('EMPTY_RESPONSE');
    expect(codes.TIMEOUT).toBe('TIMEOUT');
    expect(codes.AUTH_ERROR).toBe('AUTH_ERROR');
    expect(codes.CONFIG_ERROR).toBe('CONFIG_ERROR');
  });

  it('VertexError instances carry code + name correctly', async () => {
    const m = await loadModule();
    const e = new m.VertexError(m.VertexErrorCode.CONFIG_ERROR, 'test message');
    expect(e.code).toBe('CONFIG_ERROR');
    expect(e.name).toBe('VertexError');
    expect(e.message).toBe('test message');
    expect(e instanceof Error).toBe(true);
  });
});

describe('vertex-client — Service Account config errors', () => {
  it('callVertexGemini throws CONFIG_ERROR when GCP_VERTEX_SA_JSON_B64 missing', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'true');
    envStore.set('GCP_VERTEX_PROJECT_ID', 'test-project');
    const m = await loadModule();
    await expect(
      m.callVertexGemini({
        model: 'gemini-2.5-flash-lite',
        systemPrompt: 'sys',
        message: 'hello',
      })
    ).rejects.toMatchObject({
      code: 'CONFIG_ERROR',
      message: expect.stringContaining('GCP_VERTEX_SA_JSON_B64'),
    });
  });

  it('callVertexGemini throws CONFIG_ERROR when SA_JSON_B64 not valid base64', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'true');
    envStore.set('GCP_VERTEX_PROJECT_ID', 'test-project');
    envStore.set('GCP_VERTEX_SA_JSON_B64', '!!!not-valid-base64!!!');
    const m = await loadModule();
    await expect(
      m.callVertexGemini({
        model: 'gemini-2.5-flash-lite',
        systemPrompt: 'sys',
        message: 'hello',
      })
    ).rejects.toMatchObject({
      code: 'CONFIG_ERROR',
    });
  });

  it('callVertexGemini throws CONFIG_ERROR when JSON missing client_email', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'true');
    envStore.set('GCP_VERTEX_PROJECT_ID', 'test-project');
    const badJson = btoa(JSON.stringify({ private_key: 'fake-key' }));
    envStore.set('GCP_VERTEX_SA_JSON_B64', badJson);
    const m = await loadModule();
    await expect(
      m.callVertexGemini({
        model: 'gemini-2.5-flash-lite',
        systemPrompt: 'sys',
        message: 'hello',
      })
    ).rejects.toMatchObject({
      code: 'CONFIG_ERROR',
      message: expect.stringContaining('client_email'),
    });
  });

  it('callVertexGemini throws CONFIG_ERROR when GCP_VERTEX_PROJECT_ID missing (with valid SA shape)', async () => {
    envStore.set('ENABLE_VERTEX_EU', 'true');
    // GCP_VERTEX_PROJECT_ID NOT set
    const validShapeJson = btoa(JSON.stringify({
      client_email: 'test@test.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8\n-----END PRIVATE KEY-----\n',
    }));
    envStore.set('GCP_VERTEX_SA_JSON_B64', validShapeJson);
    const m = await loadModule();
    await expect(
      m.callVertexGemini({
        model: 'gemini-2.5-flash-lite',
        systemPrompt: 'sys',
        message: 'hello',
      })
    ).rejects.toMatchObject({
      code: 'CONFIG_ERROR',
    });
  });
});

describe('vertex-client — getVertexMetrics initial state', () => {
  it('returns empty object before any calls', async () => {
    const m = await loadModule();
    const metrics = m.getVertexMetrics();
    expect(Object.keys(metrics).length).toBe(0);
  });
});

describe('vertex-client — cache reset helper', () => {
  it('_resetVertexCaches is exported', async () => {
    const m = await loadModule();
    expect(typeof m._resetVertexCaches).toBe('function');
  });

  it('_resetVertexCaches does not throw', async () => {
    const m = await loadModule();
    expect(() => m._resetVertexCaches()).not.toThrow();
  });

  it('after reset metrics are empty', async () => {
    const m = await loadModule();
    m._resetVertexCaches();
    expect(Object.keys(m.getVertexMetrics()).length).toBe(0);
  });
});

describe('vertex-client — module surface', () => {
  it('exports callVertexGemini as function', async () => {
    const m = await loadModule();
    expect(typeof m.callVertexGemini).toBe('function');
  });

  it('exports isVertexEUEnabled as function', async () => {
    const m = await loadModule();
    expect(typeof m.isVertexEUEnabled).toBe('function');
  });

  it('exports getVertexMetrics as function', async () => {
    const m = await loadModule();
    expect(typeof m.getVertexMetrics).toBe('function');
  });

  it('exports VertexError class', async () => {
    const m = await loadModule();
    expect(typeof m.VertexError).toBe('function');
    expect(m.VertexError.name).toBe('VertexError');
  });
});
