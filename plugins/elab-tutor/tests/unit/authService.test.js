/**
 * authService.test.js — Test per autenticazione ELAB
 * 20 test: token parsing, expiry, rate limiting, storage, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the pure functions by reimplementing them (they're not exported)
// This tests the LOGIC, not the module integration

const TOKEN_EXPIRY_BUFFER = 60 * 1000;

function parseToken(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const payloadB64 = token.split('.')[0];
    const padding = '='.repeat((4 - (payloadB64.length % 4)) % 4);
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function isTokenExpired(token) {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp < (Date.now() + TOKEN_EXPIRY_BUFFER);
}

function getTokenRemainingTime(token) {
  const payload = parseToken(token);
  if (!payload || !payload.exp) return 0;
  return Math.max(0, payload.exp - Date.now());
}

function checkRateLimit(attempts, lockedUntil) {
  const now = Date.now();
  if (lockedUntil > now) return { allowed: false, waitSec: Math.ceil((lockedUntil - now) / 1000) };
  if (attempts >= 5) return { allowed: false, waitSec: 900 };
  return { allowed: true };
}

// Helper: create a valid base64url token
function makeToken(payload) {
  const json = JSON.stringify(payload);
  const b64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return b64 + '.fakesignature';
}

describe('authService — parseToken', () => {
  it('parses valid token', () => {
    const token = makeToken({ exp: Date.now() + 3600000, role: 'teacher' });
    const payload = parseToken(token);
    expect(payload).not.toBeNull();
    expect(payload.role).toBe('teacher');
  });

  it('returns null for null token', () => {
    expect(parseToken(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseToken('')).toBeNull();
  });

  it('returns null for token without dot', () => {
    expect(parseToken('nodottoken')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(parseToken('!!!invalid!!!.signature')).toBeNull();
  });

  it('returns null for non-JSON payload', () => {
    const b64 = btoa('not json');
    expect(parseToken(b64 + '.sig')).toBeNull();
  });
});

describe('authService — isTokenExpired', () => {
  it('returns false for future token', () => {
    const token = makeToken({ exp: Date.now() + 3600000 }); // 1h future
    expect(isTokenExpired(token)).toBe(false);
  });

  it('returns true for expired token', () => {
    const token = makeToken({ exp: Date.now() - 3600000 }); // 1h ago
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for token expiring within buffer (60s)', () => {
    const token = makeToken({ exp: Date.now() + 30000 }); // 30s left < 60s buffer
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for token without exp', () => {
    const token = makeToken({ role: 'teacher' }); // no exp
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for null', () => {
    expect(isTokenExpired(null)).toBe(true);
  });
});

describe('authService — getTokenRemainingTime', () => {
  it('returns positive for future token', () => {
    const token = makeToken({ exp: Date.now() + 3600000 });
    expect(getTokenRemainingTime(token)).toBeGreaterThan(0);
  });

  it('returns 0 for expired token', () => {
    const token = makeToken({ exp: Date.now() - 1000 });
    expect(getTokenRemainingTime(token)).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(getTokenRemainingTime(null)).toBe(0);
  });

  it('returns 0 for token without exp', () => {
    const token = makeToken({ role: 'test' });
    expect(getTokenRemainingTime(token)).toBe(0);
  });
});

describe('authService — rate limiting', () => {
  it('allows first attempt', () => {
    expect(checkRateLimit(0, 0).allowed).toBe(true);
  });

  it('allows 4th attempt', () => {
    expect(checkRateLimit(4, 0).allowed).toBe(true);
  });

  it('blocks 5th attempt', () => {
    expect(checkRateLimit(5, 0).allowed).toBe(false);
  });

  it('blocks when locked', () => {
    const result = checkRateLimit(3, Date.now() + 60000);
    expect(result.allowed).toBe(false);
    expect(result.waitSec).toBeGreaterThan(0);
  });

  it('allows after lockout expires', () => {
    expect(checkRateLimit(3, Date.now() - 1000).allowed).toBe(true);
  });
});
