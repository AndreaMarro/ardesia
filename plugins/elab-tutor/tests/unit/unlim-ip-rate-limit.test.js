/**
 * unlim-ip-rate-limit.test.js — Sprint X iter 105.3 P0 (Andrea audit C2 fix)
 *
 * Tests for `supabase/functions/_shared/ip-rate-limit.ts`.
 *
 * Audit C2: sessionId-rotation bypass — 10k sessions × 30 req/min = 300k req/min
 * bypasses the existing session-based limiter. IP-bound outer limit caps total
 * regardless of session count.
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
  extractClientIp,
  checkRateLimitByIp,
  checkRateLimitFromRequest,
  _resetIpRateLimitMap,
  IP_RATE_LIMIT_VERSION,
} = await import('../../supabase/functions/_shared/ip-rate-limit.ts');

function makeReq(headers = {}) {
  return new Request('https://example.com', { headers });
}

beforeEach(() => {
  _resetIpRateLimitMap();
  envStore.clear();
});

describe('extractClientIp — proxy-aware extraction', () => {
  it('1.1 — CF-Connecting-IP takes priority', () => {
    const req = makeReq({
      'CF-Connecting-IP': '1.1.1.1',
      'x-forwarded-for': '2.2.2.2',
    });
    expect(extractClientIp(req)).toBe('1.1.1.1');
  });

  it('1.2 — x-vercel-forwarded-for second priority', () => {
    const req = makeReq({
      'x-vercel-forwarded-for': '3.3.3.3',
      'x-forwarded-for': '2.2.2.2',
    });
    expect(extractClientIp(req)).toBe('3.3.3.3');
  });

  it('1.3 — x-real-ip third priority', () => {
    const req = makeReq({
      'x-real-ip': '4.4.4.4',
      'x-forwarded-for': '2.2.2.2',
    });
    expect(extractClientIp(req)).toBe('4.4.4.4');
  });

  it('1.4 — x-forwarded-for fallback takes leftmost', () => {
    const req = makeReq({
      'x-forwarded-for': '5.5.5.5, 6.6.6.6, 7.7.7.7',
    });
    expect(extractClientIp(req)).toBe('5.5.5.5');
  });

  it('1.5 — no headers returns "unknown"', () => {
    expect(extractClientIp(makeReq())).toBe('unknown');
  });

  it('1.6 — whitespace headers trimmed', () => {
    const req = makeReq({ 'CF-Connecting-IP': '  1.1.1.1  ' });
    expect(extractClientIp(req)).toBe('1.1.1.1');
  });

  it('1.7 — empty header value falls through', () => {
    const req = makeReq({
      'CF-Connecting-IP': '',
      'x-real-ip': '4.4.4.4',
    });
    expect(extractClientIp(req)).toBe('4.4.4.4');
  });
});

describe('checkRateLimitByIp — basic flow', () => {
  it('2.1 — first call returns true (within limit)', () => {
    expect(checkRateLimitByIp('1.1.1.1')).toBe(true);
  });

  it('2.2 — 100 calls within limit (default max=100)', () => {
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('1.1.1.1')).toBe(true);
    }
  });

  it('2.3 — 101st call exceeds limit returns false', () => {
    for (let i = 0; i < 100; i++) checkRateLimitByIp('1.1.1.1');
    expect(checkRateLimitByIp('1.1.1.1')).toBe(false);
  });

  it('2.4 — different IPs have separate buckets', () => {
    for (let i = 0; i < 100; i++) checkRateLimitByIp('1.1.1.1');
    expect(checkRateLimitByIp('1.1.1.1')).toBe(false);
    expect(checkRateLimitByIp('2.2.2.2')).toBe(true);
  });

  it('2.5 — env IP_RATE_LIMIT_MAX overrides default', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '5');
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimitByIp('1.1.1.1')).toBe(true);
    }
    expect(checkRateLimitByIp('1.1.1.1')).toBe(false);
  });

  it('2.6 — empty IP defaults to "unknown" bucket', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '3');
    expect(checkRateLimitByIp('')).toBe(true);
    expect(checkRateLimitByIp('unknown')).toBe(true);
    expect(checkRateLimitByIp('')).toBe(true);
    // 4th hit on shared bucket → over limit
    expect(checkRateLimitByIp('')).toBe(false);
  });

  it('2.7 — STRICT_IP_RATE_LIMIT_UNKNOWN=true rejects unknown immediately', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('')).toBe(false);
    expect(checkRateLimitByIp('unknown')).toBe(false);
  });

  it('2.8 — STRICT mode does NOT reject known IPs', () => {
    envStore.set('STRICT_IP_RATE_LIMIT_UNKNOWN', 'true');
    expect(checkRateLimitByIp('1.1.1.1')).toBe(true);
  });
});

describe('checkRateLimitFromRequest — convenience wrapper', () => {
  it('3.1 — extracts IP and applies limit in one call', () => {
    const req = makeReq({ 'CF-Connecting-IP': '1.1.1.1' });
    const result = checkRateLimitFromRequest(req);
    expect(result.ok).toBe(true);
    expect(result.ip).toBe('1.1.1.1');
  });

  it('3.2 — returns ip even when over limit', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '1');
    const req = makeReq({ 'CF-Connecting-IP': '1.1.1.1' });
    checkRateLimitFromRequest(req); // first call OK
    const second = checkRateLimitFromRequest(req);
    expect(second.ok).toBe(false);
    expect(second.ip).toBe('1.1.1.1');
  });
});

describe('Audit C2 scenario — sessionId rotation defense', () => {
  it('4.1 — attacker rotates 10k sessionIds from same IP → still rate-limited', () => {
    envStore.set('IP_RATE_LIMIT_MAX', '100');
    // Simulate the attacker pattern: 10k DIFFERENT sessionIds from same IP.
    // Per-session limiter would let 10k × 30 = 300k req/min through, but
    // per-IP limiter caps at 100/min regardless of session count.
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimitByIp('attacker.ip')).toBe(true);
    }
    // 101st blocked
    expect(checkRateLimitByIp('attacker.ip')).toBe(false);
    // Different IP still allowed (legit client)
    expect(checkRateLimitByIp('legit.ip')).toBe(true);
  });
});

describe('Module exports', () => {
  it('5.1 — IP_RATE_LIMIT_VERSION exports versioned string', () => {
    expect(typeof IP_RATE_LIMIT_VERSION).toBe('string');
  });
});
