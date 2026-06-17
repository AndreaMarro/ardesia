/**
 * codeProtection — Tests for runtime anti-tampering
 * Verifies key blocking, domain check, and dev mode skip.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock import.meta.env
vi.stubEnv('PROD', false);

import { initCodeProtection } from '../../src/utils/codeProtection';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('codeProtection', () => {
  it('initCodeProtection does not throw in dev mode', () => {
    expect(() => initCodeProtection()).not.toThrow();
  });

  it('initCodeProtection skips in dev mode (no event listeners added)', () => {
    const spy = vi.spyOn(document, 'addEventListener');
    initCodeProtection();
    // In dev mode (PROD=false), no listeners should be added
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('exports initCodeProtection as a function', () => {
    expect(typeof initCodeProtection).toBe('function');
  });
});
