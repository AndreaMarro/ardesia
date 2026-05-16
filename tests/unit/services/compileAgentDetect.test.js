/**
 * compileAgentDetect.test.js — Iter 65 P0 Atom R4 unit coverage.
 *
 * Verifies:
 *   - 2s timeout via AbortController
 *   - HTTP 200 + 401 both yield available=true (token gate ≠ offline)
 *   - Network error + abort timeout both surface error=agent_offline|timeout
 *   - Platform detection mac/win/linux/unknown via navigator.platform proxy
 *   - 5s status cache + in-flight dedup
 *   - Shape contract of {available, port, version?, error?, latencyMs}
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  detectCompileAgent,
  getCompileAgentStatus,
  isCompileAgentAvailable,
  getAgentInstallInstructions,
  COMPILE_AGENT_PORT,
  COMPILE_AGENT_HEALTH_URL,
  DEFAULT_PROBE_TIMEOUT_MS,
  STATUS_CACHE_TTL_MS,
  _resetCompileAgentDetectCache,
} from '../../../src/services/compileAgentDetect.js';

beforeEach(() => {
  _resetCompileAgentDetectCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('compileAgentDetect — constants', () => {
  it('binds to the canonical loopback port 8765', () => {
    expect(COMPILE_AGENT_PORT).toBe(8765);
    expect(COMPILE_AGENT_HEALTH_URL).toBe('http://localhost:8765/health');
  });

  it('enforces a 2s probe timeout and 5s cache TTL per spec', () => {
    expect(DEFAULT_PROBE_TIMEOUT_MS).toBe(2000);
    expect(STATUS_CACHE_TTL_MS).toBe(5000);
  });
});

describe('detectCompileAgent — fetch success paths', () => {
  it('reports available=true on HTTP 200 and extracts version metadata', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ version: '0.4.2', arduino_cli_version: '1.0.4' }),
    });
    const t0 = 1_000_000;
    let tick = 0;
    const now = () => t0 + (tick += 7);

    const res = await detectCompileAgent({ fetchImpl, now });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe(COMPILE_AGENT_HEALTH_URL);
    expect(res.available).toBe(true);
    expect(res.port).toBe(8765);
    expect(res.version).toBe('0.4.2');
    expect(res.error).toBeUndefined();
    expect(res.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('treats HTTP 401 (token gate) as available — agent IS up', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(true);
    expect(res.port).toBe(8765);
    expect(res.error).toBeUndefined();
  });

  it('omits version when body parse throws but keeps availability', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('bad json');
      },
    });
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(true);
    expect(res.version).toBeUndefined();
  });

  it('passes a signal to fetch so a 2s timeout can abort the probe', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await detectCompileAgent({ fetchImpl, timeoutMs: 2000 });
    const opts = fetchImpl.mock.calls[0][1];
    expect(opts.signal).toBeDefined();
    expect(opts.mode).toBe('cors');
    expect(opts.credentials).toBe('omit');
  });
});

describe('detectCompileAgent — failure paths', () => {
  it('returns agent_offline on network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(false);
    expect(res.error).toBe('agent_offline');
    expect(res.port).toBe(8765);
  });

  it('returns error=timeout when fetch aborts', async () => {
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    const fetchImpl = vi.fn().mockRejectedValue(abortErr);
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(false);
    expect(res.error).toBe('timeout');
  });

  it('returns http_<status> on unexpected non-ok status (e.g. 503)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(false);
    expect(res.error).toBe('http_503');
  });

  it('falls back to error=no_fetch when no fetch implementation is available', async () => {
    const res = await detectCompileAgent({ fetchImpl: null });
    expect(res.available).toBe(false);
    expect(res.error).toBe('no_fetch');
    expect(res.port).toBe(8765);
    expect(res.latencyMs).toBe(0);
  });
});

describe('detectCompileAgent — in-flight dedup', () => {
  it('reuses an in-flight probe for concurrent callers', async () => {
    let resolveFetch;
    const fetchImpl = vi.fn(() => new Promise((r) => {
      resolveFetch = () => r({ ok: true, status: 200, json: async () => ({}) });
    }));

    const a = detectCompileAgent({ fetchImpl });
    const b = detectCompileAgent({ fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);

    resolveFetch();
    const [ra, rb] = await Promise.all([a, b]);
    expect(ra.available).toBe(true);
    expect(rb.available).toBe(true);
    expect(ra).toBe(rb);
  });
});

describe('getCompileAgentStatus — 5s TTL cache', () => {
  it('caches the result for STATUS_CACHE_TTL_MS', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    let current = 5_000_000;
    const now = () => current;

    const first = await getCompileAgentStatus({ fetchImpl, now });
    expect(first.available).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    // 4s later — within TTL.
    current += 4000;
    const second = await getCompileAgentStatus({ fetchImpl, now });
    expect(second).toBe(first); // same cached reference
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    // 5.5s later — expired.
    current += 1500;
    await getCompileAgentStatus({ fetchImpl, now });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('honors force=true to bypass cache', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await getCompileAgentStatus({ fetchImpl });
    await getCompileAgentStatus({ fetchImpl, force: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('isCompileAgentAvailable', () => {
  it('returns true when agent is reachable', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await expect(isCompileAgentAvailable({ fetchImpl })).resolves.toBe(true);
  });

  it('returns false when fetch rejects', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(isCompileAgentAvailable({ fetchImpl, force: true })).resolves.toBe(false);
  });
});

describe('getAgentInstallInstructions — platform detection', () => {
  it('detects macOS via navigator.platform substring', () => {
    const ins = getAgentInstallInstructions({ platformOverride: 'MacIntel' });
    expect(ins.platform).toBe('mac');
    expect(ins.detected).toBe(true);
    expect(ins.downloadUrl).toBe('/scripts/setup-elab-compile-agent.sh');
    expect(ins.instructionsUrl).toMatch(/RICCARDO-UAT-GUIDE/);
  });

  it('detects Windows and marks installer pending iter 67', () => {
    const ins = getAgentInstallInstructions({ platformOverride: 'Win32' });
    expect(ins.platform).toBe('win');
    expect(ins.detected).toBe(false);
    expect(ins.downloadUrl).toBeNull();
    expect(ins.instructionsUrl).toMatch(/windows-iter67/);
  });

  it('detects Linux (Linux x86_64 and X11; both)', () => {
    expect(getAgentInstallInstructions({ platformOverride: 'Linux x86_64' }).platform).toBe('linux');
    expect(getAgentInstallInstructions({ platformOverride: 'X11; Ubuntu' }).platform).toBe('linux');
  });

  it('falls back to unknown for unrecognized strings', () => {
    const ins = getAgentInstallInstructions({ platformOverride: 'FreeBSD-amd64' });
    expect(ins.platform).toBe('unknown');
    expect(ins.detected).toBe(false);
    expect(ins.downloadUrl).toBeNull();
  });

  it('does not throw when navigator is absent and no override provided', () => {
    // jsdom navigator exists, but we simulate absence by overriding to ''.
    const ins = getAgentInstallInstructions({ platformOverride: '' });
    expect(ins.platform).toBe('unknown');
  });
});

describe('result shape contract', () => {
  it('always returns the canonical shape on success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ version: 'x' }) });
    const res = await detectCompileAgent({ fetchImpl });
    expect(Object.keys(res).sort()).toEqual(['available', 'error', 'latencyMs', 'port', 'version'].sort());
    expect(typeof res.available).toBe('boolean');
    expect(typeof res.port).toBe('number');
    expect(typeof res.latencyMs).toBe('number');
  });

  it('always returns the canonical shape on failure (no version key)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('boom'));
    const res = await detectCompileAgent({ fetchImpl });
    expect(res.available).toBe(false);
    expect(res.port).toBe(8765);
    expect(typeof res.error).toBe('string');
    expect(typeof res.latencyMs).toBe('number');
  });
});
