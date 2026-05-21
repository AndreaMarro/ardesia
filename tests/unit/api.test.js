/**
 * api.test.js — Test per main API service ELAB
 * 10 test: rate limiting, exports, error handling, edge cases
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
}));

global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));

const sStore = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(k => sStore[k] || null),
    setItem: vi.fn((k, v) => { sStore[k] = v; }),
    removeItem: vi.fn(k => { delete sStore[k]; }),
  },
  writable: true,
});

import { checkRateLimit, sendChat, compileCode, diagnoseCircuit, getExperimentHints, preloadExperiment } from '../../src/services/api';

beforeEach(() => {
  Object.keys(sStore).forEach(k => delete sStore[k]);
  vi.clearAllMocks();
  global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));
});

describe('api — exports', () => {
  it('exports sendChat function', () => {
    expect(typeof sendChat).toBe('function');
  });

  it('exports compileCode function', () => {
    expect(typeof compileCode).toBe('function');
  });

  it('exports diagnoseCircuit function', () => {
    expect(typeof diagnoseCircuit).toBe('function');
  });

  it('exports getExperimentHints function', () => {
    expect(typeof getExperimentHints).toBe('function');
  });

  it('exports checkRateLimit function', () => {
    expect(typeof checkRateLimit).toBe('function');
  });

  it('exports preloadExperiment function', () => {
    expect(typeof preloadExperiment).toBe('function');
  });
});

describe('api — checkRateLimit', () => {
  it('allows first request', () => {
    const result = checkRateLimit();
    expect(result.allowed).toBe(true);
  });

  it('returns object with allowed and waitSec', () => {
    const result = checkRateLimit();
    expect(result).toHaveProperty('allowed');
  });
});

describe('api — edge cases', () => {
  it('sendChat handles network error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const result = await sendChat('test message');
    expect(result).toBeDefined();
  });

  it('compileCode handles network error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const result = await compileCode('void setup(){}');
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  });
});

describe('api — compileCode provider honesty', () => {
  it('tags the legacy n8n fallback so the UI cannot present it as Nano R4 compile', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_COMPILE_PROXY_URL', 'https://example.supabase.co/functions/v1/compile-proxy');
    vi.stubGlobal('window', {
      ...window,
      location: { ...window.location, protocol: 'https:' },
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve('{"error":"cloud_compile_not_configured"}') })
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({
        success: true,
        hex: ':100000000C945C000C946E000C946E000C946E00',
        output: 'AVR compile ok',
      })) });
    global.fetch = fetchMock;

    const { compileCode: compileCodeFresh } = await import('../../src/services/api');
    const result = await compileCodeFresh('void setup(){}', 'arduino:renesas_uno:nanor4');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/compile/nanor4');
    expect(fetchMock.mock.calls[1][0]).toBe('https://example.supabase.co/functions/v1/compile-proxy');
    expect(result.success).toBe(true);
    expect(result.provider).toBe('n8n-avr-legacy');
    expect(result.targetFqbn).toBe('arduino:renesas_uno:nanor4');
  });

  it('does not call a browser-direct Cloud Render endpoint when the secure proxy is unavailable', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_ELAB_CLOUD_COMPILE_URL', 'https://elab-cloud-direct.example.com');
    vi.stubEnv('VITE_COMPILE_PROXY_URL', 'https://example.supabase.co/functions/v1/compile-proxy');
    vi.stubGlobal('window', {
      ...window,
      location: { ...window.location, protocol: 'https:' },
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve('{"error":"cloud_compile_not_configured"}') })
      .mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({
        success: true,
        hex: ':100000000C945C000C946E000C946E000C946E00',
        output: 'AVR compile ok',
      })) });
    global.fetch = fetchMock;

    const { compileCode: compileCodeFresh } = await import('../../src/services/api');
    const result = await compileCodeFresh('void setup(){}', 'arduino:renesas_uno:nanor4');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      '/api/compile/nanor4',
      'https://example.supabase.co/functions/v1/compile-proxy',
    ]);
    expect(fetchMock.mock.calls.map((c) => c[0]).join('\n')).not.toContain('elab-cloud-direct.example.com');
    expect(result.provider).toBe('n8n-avr-legacy');
  });
});
