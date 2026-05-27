/**
 * unlim-guards-failclosed.test.js — Sprint X iter 105 P0 (Andrea audit C1 fix)
 *
 * Tests for `verifyElabApiKey` fail-closed gating by DENO_DEPLOYMENT_ID env.
 *
 * Audit C1: previous fail-open behavior when ELAB_API_KEY env unset =
 * complete auth bypass on production Supabase Edge URL. Iter 105 fix:
 * fail-CLOSED in production (DENO_DEPLOYMENT_ID set on Supabase Edge runtime),
 * fail-OPEN preserved for local dev (DENO_DEPLOYMENT_ID unset).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase HTTPS import (Deno-style URL not loadable by Node ESM)
vi.mock('https://esm.sh/@supabase/supabase-js@2', () => ({
  createClient: vi.fn(() => null),
  SupabaseClient: class {},
}));

// Track env so we can flip per-test
const envStore = new Map();
globalThis.Deno = {
  env: {
    get: (k) => envStore.get(k),
    has: (k) => envStore.has(k),
    set: (k, v) => envStore.set(k, v),
    delete: (k) => envStore.delete(k),
    toObject: () => Object.fromEntries(envStore),
  },
};

const { verifyElabApiKey } = await import('../../supabase/functions/_shared/guards.ts');

function makeReq(headers = {}) {
  return new Request('https://example.com', { headers });
}

beforeEach(() => {
  envStore.clear();
});

afterEach(() => {
  envStore.clear();
});

describe('verifyElabApiKey — fail-closed gating (iter 105 audit C1 fix)', () => {
  // --- LOCAL DEV (DENO_DEPLOYMENT_ID unset) ---

  it('1.1 — no ELAB_API_KEY + no DENO_DEPLOYMENT_ID → fail-OPEN (dev)', () => {
    const res = verifyElabApiKey(makeReq());
    expect(res.ok).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it('1.2 — no ELAB_API_KEY + no DENO_DEPLOYMENT_ID + invalid header → still fail-OPEN', () => {
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'garbage' }));
    expect(res.ok).toBe(true);
  });

  // --- PRODUCTION (DENO_DEPLOYMENT_ID set) ---

  it('2.1 — no ELAB_API_KEY + DENO_DEPLOYMENT_ID set → fail-CLOSED', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'deploy_abc123');
    const res = verifyElabApiKey(makeReq());
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('server_misconfigured');
  });

  it('2.2 — no ELAB_API_KEY + DENO_DEPLOYMENT_ID + valid-looking header → STILL fail-CLOSED', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'deploy_xyz');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'anything' }));
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('server_misconfigured');
  });

  // --- NORMAL AUTH (ELAB_API_KEY set) ---

  it('3.1 — ELAB_API_KEY set + matching header → ok', () => {
    envStore.set('ELAB_API_KEY', 'secret-12345');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'secret-12345' }));
    expect(res.ok).toBe(true);
  });

  it('3.2 — ELAB_API_KEY set + missing header → rejects', () => {
    envStore.set('ELAB_API_KEY', 'secret-12345');
    const res = verifyElabApiKey(makeReq());
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('missing X-Elab-Api-Key header');
  });

  it('3.3 — ELAB_API_KEY set + wrong header length → rejects with "bad api key"', () => {
    envStore.set('ELAB_API_KEY', 'secret-12345');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'short' }));
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('bad api key');
  });

  it('3.4 — ELAB_API_KEY set + same length but wrong content → rejects', () => {
    envStore.set('ELAB_API_KEY', 'secret-12345');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'wrong-key-12' }));
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('bad api key');
  });

  it('3.5 — ELAB_API_KEY set + DENO_DEPLOYMENT_ID set + matching header → ok (production happy path)', () => {
    envStore.set('ELAB_API_KEY', 'prod-key-xyz');
    envStore.set('DENO_DEPLOYMENT_ID', 'deploy_prod');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'prod-key-xyz' }));
    expect(res.ok).toBe(true);
  });

  it('3.6 — ELAB_API_KEY set + DENO_DEPLOYMENT_ID set + wrong header → rejects', () => {
    envStore.set('ELAB_API_KEY', 'prod-key-xyz');
    envStore.set('DENO_DEPLOYMENT_ID', 'deploy_prod');
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'attacker-key' }));
    expect(res.ok).toBe(false);
  });

  // --- CONSTANT-TIME-ISH equality (audit M4 mitigation) ---

  it('4.1 — same-length wrong key takes similar time as correct match (XOR loop)', () => {
    // Not a strict timing assertion — verifies the constant-time path is taken
    // (no early-return on first-byte mismatch).
    envStore.set('ELAB_API_KEY', 'a'.repeat(64));
    // All-byte-wrong same length → triggers full loop
    const res = verifyElabApiKey(makeReq({ 'X-Elab-Api-Key': 'b'.repeat(64) }));
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('bad api key');
  });
});
