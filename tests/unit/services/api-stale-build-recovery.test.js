/**
 * api-stale-build-recovery.test.js — iter 103
 *
 * Regression context: a stale PWA-service-worker-cached frontend bundles an
 * outdated VITE_ELAB_API_KEY (e.g. after a key rotation). The Edge Function
 * rejects it with HTTP 401. Before the fix, tryNanobot swallowed the 401
 * (`if (!res.ok) return null`) and sendChat cascaded into the legacy Render +
 * n8n fallbacks -> ~25s timeout -> misleading "ci sta mettendo un po' troppo"
 * message. The teacher retries forever instead of reloading the page.
 *
 * Fixed behavior: a 401/403 from the Edge surfaces a "ricarica la pagina"
 * error and skips the dead fallback chain - a stale build becomes self-healing.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

const sStore = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(k => sStore[k] || null),
    setItem: vi.fn((k, v) => { sStore[k] = v; }),
    removeItem: vi.fn(k => { delete sStore[k]; }),
    clear: vi.fn(() => { Object.keys(sStore).forEach(k => delete sStore[k]); }),
  },
  writable: true,
});

global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));

import { sendChat } from '../../../src/services/api';

/**
 * fetch mock: the Edge Function (unlim-chat) returns 401 (stale build key).
 * Every other endpoint (localhost health, Render, n8n) returns a generic
 * failure. Records every URL fetched so tests can assert the fallback chain.
 */
function mock401Edge() {
  const calledUrls = [];
  global.fetch = vi.fn((url) => {
    const u = String(url);
    calledUrls.push(u);
    if (u.includes('unlim-chat')) {
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ success: false, error: 'unauthorized' }),
        text: () => Promise.resolve('{"error":"unauthorized"}'),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    });
  });
  return calledUrls;
}

beforeEach(() => {
  Object.keys(sStore).forEach(k => delete sStore[k]);
  vi.clearAllMocks();
});

describe('sendChat - stale-build 401 recovery', () => {
  it('shows a reload-the-page message when the Edge returns 401', async () => {
    mock401Edge();
    const result = await sendChat('Cosa fa un LED?');
    expect(result.success).toBe(false);
    expect(result.response.toLowerCase()).toContain('ricarica');
  });

  it('skips the legacy Render fallback when the Edge returns 401', async () => {
    const calledUrls = mock401Edge();
    await sendChat('Cosa fa un LED?');
    expect(calledUrls.some(u => u.includes('onrender.com'))).toBe(false);
  });
});
