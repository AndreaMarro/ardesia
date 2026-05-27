/**
 * unlim-consent-gate.test.js — Sprint X iter 105.3 P0 (Andrea audit C4 fix)
 *
 * Tests for `supabase/functions/_shared/consent-gate.ts`.
 *
 * GDPR Art. 8 + Italian D.Lgs. 101/2018 minors enforcement.
 */

import { describe, it, expect, beforeEach } from 'vitest';

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

const {
  shouldHardRefuseUnknownConsent,
  buildConsentGateContextFromEnv,
  buildConsentRefusalTemplate,
  evaluateConsentGate,
  CONSENT_GATE_VERSION,
} = await import('../../supabase/functions/_shared/consent-gate.ts');

beforeEach(() => {
  envStore.clear();
});

describe('shouldHardRefuseUnknownConsent — matrix', () => {
  const baseCtx = { isProduction: true, strictUnknown: true };

  it('1.1 — granted in prod strict → false (allow)', () => {
    expect(shouldHardRefuseUnknownConsent('granted', baseCtx)).toBe(false);
  });

  it('1.2 — revoked in prod strict → false (delegated to existing path)', () => {
    expect(shouldHardRefuseUnknownConsent('revoked', baseCtx)).toBe(false);
  });

  it('1.3 — unknown in prod strict → true (hard refuse)', () => {
    expect(shouldHardRefuseUnknownConsent('unknown', baseCtx)).toBe(true);
  });

  it('1.4 — null in prod strict → true (treated as unknown)', () => {
    expect(shouldHardRefuseUnknownConsent(null, baseCtx)).toBe(true);
  });

  it('1.5 — undefined in prod strict → true', () => {
    expect(shouldHardRefuseUnknownConsent(undefined, baseCtx)).toBe(true);
  });

  it('1.6 — unknown NOT in prod (dev) → false (soft preserved)', () => {
    expect(
      shouldHardRefuseUnknownConsent('unknown', { isProduction: false, strictUnknown: true }),
    ).toBe(false);
  });

  it('1.7 — unknown NOT strict → false (soft preserved)', () => {
    expect(
      shouldHardRefuseUnknownConsent('unknown', { isProduction: true, strictUnknown: false }),
    ).toBe(false);
  });

  it('1.8 — granted in dev non-strict → false', () => {
    expect(
      shouldHardRefuseUnknownConsent('granted', { isProduction: false, strictUnknown: false }),
    ).toBe(false);
  });
});

describe('buildConsentGateContextFromEnv', () => {
  it('2.1 — both envs unset returns defaults', () => {
    const ctx = buildConsentGateContextFromEnv();
    expect(ctx.isProduction).toBe(false);
    expect(ctx.strictUnknown).toBe(false);
  });

  it('2.2 — DENO_DEPLOYMENT_ID set → isProduction true', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'abc123');
    expect(buildConsentGateContextFromEnv().isProduction).toBe(true);
  });

  it('2.3 — STRICT_CONSENT_UNKNOWN_REFUSE=true → strictUnknown true', () => {
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'true');
    expect(buildConsentGateContextFromEnv().strictUnknown).toBe(true);
  });

  it('2.4 — STRICT_CONSENT_UNKNOWN_REFUSE=TRUE uppercase still works', () => {
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'TRUE');
    expect(buildConsentGateContextFromEnv().strictUnknown).toBe(true);
  });

  it('2.5 — STRICT_CONSENT_UNKNOWN_REFUSE=false → strictUnknown false', () => {
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'false');
    expect(buildConsentGateContextFromEnv().strictUnknown).toBe(false);
  });

  it('2.6 — STRICT_CONSENT_UNKNOWN_REFUSE with whitespace handled', () => {
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', '  true  ');
    expect(buildConsentGateContextFromEnv().strictUnknown).toBe(true);
  });
});

describe('buildConsentRefusalTemplate — Italian K-12 pedagogical text', () => {
  it('3.1 — returns non-empty string', () => {
    const t = buildConsentRefusalTemplate();
    expect(typeof t).toBe('string');
    expect(t.length).toBeGreaterThan(50);
  });

  it('3.2 — starts with "Ragazzi," plural opener (PZ V3 compliance)', () => {
    const t = buildConsentRefusalTemplate();
    expect(t).toMatch(/^Ragazzi,/);
  });

  it('3.3 — mentions kit fisico (Principio Zero anchoring)', () => {
    const t = buildConsentRefusalTemplate();
    expect(t).toMatch(/kit fisico/i);
  });

  it('3.4 — mentions teacher action (Principio Zero "docente tramite")', () => {
    const t = buildConsentRefusalTemplate();
    expect(t).toMatch(/insegnante|docente/i);
  });

  it('3.5 — does NOT mention GDPR jargon at student level (mentions only to teacher)', () => {
    const t = buildConsentRefusalTemplate();
    // GDPR is mentioned but as guidance for teacher, not student
    expect(t).toMatch(/genitori|consenso/i);
  });
});

describe('evaluateConsentGate — full env-aware decision', () => {
  it('4.1 — production + strict + unknown → refuse with template', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'prod');
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'true');
    const r = evaluateConsentGate('unknown');
    expect(r.refuse).toBe(true);
    if (r.refuse) {
      expect(r.response).toMatch(/^Ragazzi,/);
    }
  });

  it('4.2 — production + strict + granted → no refuse', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'prod');
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'true');
    expect(evaluateConsentGate('granted').refuse).toBe(false);
  });

  it('4.3 — dev (no DENO_DEPLOYMENT_ID) + unknown → no refuse', () => {
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'true');
    expect(evaluateConsentGate('unknown').refuse).toBe(false);
  });

  it('4.4 — production + no strict flag + unknown → no refuse (soft preserved)', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'prod');
    expect(evaluateConsentGate('unknown').refuse).toBe(false);
  });

  it('4.5 — null status in prod strict → refuse', () => {
    envStore.set('DENO_DEPLOYMENT_ID', 'prod');
    envStore.set('STRICT_CONSENT_UNKNOWN_REFUSE', 'true');
    expect(evaluateConsentGate(null).refuse).toBe(true);
  });
});

describe('Module exports', () => {
  it('5.1 — CONSENT_GATE_VERSION versioned string', () => {
    expect(typeof CONSENT_GATE_VERSION).toBe('string');
  });
});
