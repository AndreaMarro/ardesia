/**
 * uploadAgent.test.js — Wave 2 Atom-D unit coverage.
 *
 * Verifies the unified upload facade:
 *   - detectCapabilities() shape contract + webSerial gating
 *   - uploadViaElabAgent POST to canonical port 8765 + progress + timeout
 *   - uploadViaWebSerial line-by-line write + onProgress increments
 *   - uploadHex orchestrator with explicit ElabAgent → Web Serial fallback chain
 *   - Italian error messages plurale "Ragazzi," for every user-facing throw
 *
 * Coverage target: ≥60% on src/services/uploadAgent.js.
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  detectCapabilities,
  uploadViaElabAgent,
  uploadViaWebSerial,
  uploadHex,
} from '../../../src/services/uploadAgent.js';

import { COMPILE_AGENT_PORT } from '../../../src/services/compileAgentDetect.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — small factories for injected dependencies.
// ─────────────────────────────────────────────────────────────────────────────

/** Build a mock fetch that resolves with the given JSON body + status. */
function fetchOk(body = { ok: true }, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

/** Build a mock fetch that rejects with AbortError (signal aborted). */
function fetchAbort() {
  return vi.fn(() => new Promise((_, reject) => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    // Defer rejection so the AbortController.signal can be observed.
    queueMicrotask(() => reject(err));
  }));
}

/** Build a mock Web Serial impl: navigator.serial-like object. */
function makeMockSerialImpl({ failOpen = false, failWrite = false } = {}) {
  const written = [];
  const writer = {
    write: vi.fn(async (chunk) => {
      if (failWrite) throw new Error('write_failed');
      written.push(chunk);
    }),
    close: vi.fn(async () => {}),
    releaseLock: vi.fn(() => {}),
  };
  const writable = {
    getWriter: vi.fn(() => writer),
  };
  const port = {
    open: vi.fn(async (_opts) => {
      if (failOpen) throw new Error('open_failed');
    }),
    close: vi.fn(async () => {}),
    writable,
    __written: written,
    __writer: writer,
  };
  return {
    requestPort: vi.fn(async () => port),
    __port: port,
  };
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// detectCapabilities — shape + webSerial gating
// ─────────────────────────────────────────────────────────────────────────────

describe('detectCapabilities', () => {
  it('returns object shape { elabAgent, webSerial, webUsb } with boolean values', async () => {
    const caps = await detectCapabilities();
    expect(Object.keys(caps).sort()).toEqual(['elabAgent', 'webSerial', 'webUsb'].sort());
    expect(typeof caps.elabAgent).toBe('boolean');
    expect(typeof caps.webSerial).toBe('boolean');
    expect(typeof caps.webUsb).toBe('boolean');
  });

  it('reports webSerial=false when navigator.serial is undefined', async () => {
    // jsdom navigator has no `serial` by default, so this should be false.
    const caps = await detectCapabilities();
    expect(caps.webSerial).toBe(false);
  });

  it('reports webSerial=true when navigator.serial is present', async () => {
    const originalNavigator = globalThis.navigator;
    // Spoof a navigator with `serial` defined.
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { ...originalNavigator, serial: {} },
    });
    try {
      const caps = await detectCapabilities();
      expect(caps.webSerial).toBe(true);
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      });
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// uploadViaElabAgent — HTTP POST to loopback agent
// ─────────────────────────────────────────────────────────────────────────────

describe('uploadViaElabAgent', () => {
  const HEX = ':020000040000FA\n:00000001FF';

  it('POSTs to the canonical 8765 endpoint with JSON body { hex, port, boardId }', async () => {
    const fetchImpl = fetchOk({ uploaded: true });
    await uploadViaElabAgent(HEX, {
      port: '/dev/cu.usbmodem1234',
      boardId: 'arduino-nano-r4',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchImpl.mock.calls[0];
    expect(url).toBe(`http://localhost:${COMPILE_AGENT_PORT}/upload`);
    expect(opts.method).toBe('POST');
    expect(opts.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(opts.body);
    expect(body.hex).toBe(HEX);
    expect(body.port).toBe('/dev/cu.usbmodem1234');
    expect(body.boardId).toBe('arduino-nano-r4');
  });

  it('calls onProgress(0) at start and onProgress(100) on success', async () => {
    const fetchImpl = fetchOk({ uploaded: true });
    const events = [];
    await uploadViaElabAgent(HEX, {
      port: '/dev/cu.usbmodem1234',
      fetchImpl,
      onProgress: (p) => events.push(p),
    });
    expect(events[0]).toBe(0);
    expect(events[events.length - 1]).toBe(100);
  });

  it('returns { ok: true, msg: "agent_ok", data } on 2xx', async () => {
    const fetchImpl = fetchOk({ uploaded: true, bytes: 12345 });
    const res = await uploadViaElabAgent(HEX, { port: '/dev/cu.x', fetchImpl });
    expect(res.ok).toBe(true);
    expect(res.msg).toBe('agent_ok');
    expect(res.data).toEqual({ uploaded: true, bytes: 12345 });
  });

  it('throws { code: "agent_timeout" } when AbortController fires', async () => {
    const fetchImpl = fetchAbort();
    await expect(
      uploadViaElabAgent(HEX, { port: '/dev/cu.x', fetchImpl, timeoutMs: 5 })
    ).rejects.toMatchObject({
      code: 'agent_timeout',
      it: expect.stringMatching(/Ragazzi/),
    });
  });

  it('throws { code: "agent_http_status" } on 500 response', async () => {
    const fetchImpl = fetchOk({ error: 'boom' }, 500);
    await expect(
      uploadViaElabAgent(HEX, { port: '/dev/cu.x', fetchImpl })
    ).rejects.toMatchObject({
      code: 'agent_http_status',
      it: expect.stringMatching(/Ragazzi/),
    });
  });

  it('throws { code: "agent_network" } on TypeError network failure', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      uploadViaElabAgent(HEX, { port: '/dev/cu.x', fetchImpl })
    ).rejects.toMatchObject({
      code: 'agent_network',
      it: expect.stringMatching(/Ragazzi/),
    });
  });

  it('throws { code: "agent_offline" } when no fetch implementation is available', async () => {
    await expect(
      uploadViaElabAgent(HEX, { port: '/dev/cu.x', fetchImpl: null })
    ).rejects.toMatchObject({
      code: 'agent_offline',
    });
  });

  it('respects custom endpoint override', async () => {
    const fetchImpl = fetchOk({ uploaded: true });
    await uploadViaElabAgent(HEX, {
      port: '/dev/cu.x',
      fetchImpl,
      endpoint: 'http://127.0.0.1:9999/upload',
    });
    expect(fetchImpl.mock.calls[0][0]).toBe('http://127.0.0.1:9999/upload');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// uploadViaWebSerial — line-by-line write + progress
// ─────────────────────────────────────────────────────────────────────────────

describe('uploadViaWebSerial', () => {
  const HEX_LINES = [
    ':020000040000FA',
    ':10000000010203040506070809',
    ':00000001FF',
  ];
  const HEX = HEX_LINES.join('\n');

  it('throws web_serial_unsupported when serialImpl is undefined and no navigator.serial', async () => {
    await expect(uploadViaWebSerial(HEX, {})).rejects.toMatchObject({
      code: 'web_serial_unsupported',
      it: expect.stringMatching(/Ragazzi.*Web Serial/),
    });
  });

  it('writes each line via writer with onProgress increments', async () => {
    const serialImpl = makeMockSerialImpl();
    const events = [];
    const res = await uploadViaWebSerial(HEX, {
      serialImpl,
      onProgress: (p) => events.push(p),
    });

    expect(res.ok).toBe(true);
    expect(res.msg).toBe('webserial_ok');
    expect(res.lines).toBe(HEX_LINES.length);
    expect(serialImpl.requestPort).toHaveBeenCalledTimes(1);
    expect(serialImpl.__port.open).toHaveBeenCalledWith({ baudRate: 115200 });

    // One write call per line.
    expect(serialImpl.__port.__writer.write).toHaveBeenCalledTimes(HEX_LINES.length);

    // Progress monotonically non-decreasing, ends at 100.
    expect(events.length).toBeGreaterThan(0);
    expect(events[events.length - 1]).toBe(100);
    for (let i = 1; i < events.length; i++) {
      expect(events[i]).toBeGreaterThanOrEqual(events[i - 1]);
    }
  });

  it('closes writer + port at the end of a successful flash', async () => {
    const serialImpl = makeMockSerialImpl();
    await uploadViaWebSerial(HEX, { serialImpl });
    expect(serialImpl.__port.__writer.close).toHaveBeenCalledTimes(1);
    expect(serialImpl.__port.close).toHaveBeenCalledTimes(1);
  });

  it('throws web_serial_failed with cause when port.open rejects', async () => {
    const serialImpl = makeMockSerialImpl({ failOpen: true });
    await expect(uploadViaWebSerial(HEX, { serialImpl })).rejects.toMatchObject({
      code: 'web_serial_failed',
      it: expect.stringMatching(/Ragazzi/),
    });
  });

  it('throws web_serial_failed with cause when writer.write rejects', async () => {
    const serialImpl = makeMockSerialImpl({ failWrite: true });
    await expect(uploadViaWebSerial(HEX, { serialImpl })).rejects.toMatchObject({
      code: 'web_serial_failed',
      it: expect.stringMatching(/Ragazzi/),
    });
  });

  it('uses custom baudRate when provided', async () => {
    const serialImpl = makeMockSerialImpl();
    await uploadViaWebSerial(HEX, { serialImpl, baudRate: 57600 });
    expect(serialImpl.__port.open).toHaveBeenCalledWith({ baudRate: 57600 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// uploadHex — orchestrator with explicit fallback chain
// ─────────────────────────────────────────────────────────────────────────────

describe('uploadHex — orchestrator fallback chain', () => {
  const HEX = ':020000040000FA\n:00000001FF';

  it('returns ElabAgent result when agent succeeds (no fallback)', async () => {
    const fetchImpl = fetchOk({ uploaded: true });
    const serialImpl = makeMockSerialImpl();
    const res = await uploadHex(HEX, {
      port: '/dev/cu.x',
      fetchImpl,
      serialImpl,
    });
    expect(res.ok).toBe(true);
    expect(res.msg).toBe('agent_ok');
    // Web Serial path NOT touched.
    expect(serialImpl.requestPort).not.toHaveBeenCalled();
  });

  it('falls back to Web Serial when ElabAgent throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const serialImpl = makeMockSerialImpl();
    // Spoof navigator.serial so capabilities flag webSerial=true.
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { ...originalNavigator, serial: serialImpl },
    });
    try {
      const res = await uploadHex(HEX, {
        port: '/dev/cu.x',
        fetchImpl,
        serialImpl,
      });
      expect(res.ok).toBe(true);
      expect(res.msg).toBe('webserial_ok');
      expect(serialImpl.requestPort).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      });
    }
  });

  it('throws no_upload_method when both ElabAgent and Web Serial unavailable', async () => {
    // No fetch + no navigator.serial available.
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      uploadHex(HEX, { port: '/dev/cu.x', fetchImpl /* serialImpl omitted */ })
    ).rejects.toMatchObject({
      code: 'no_upload_method',
      it: expect.stringMatching(/Ragazzi.*ELAB Agent.*Web Serial/),
      tried: expect.arrayContaining(['elab_agent']),
    });
  });

  it('aggregates progress across the chosen path (0..100)', async () => {
    const fetchImpl = fetchOk({ uploaded: true });
    const events = [];
    await uploadHex(HEX, {
      port: '/dev/cu.x',
      fetchImpl,
      onProgress: (p) => events.push(p),
    });
    expect(events[0]).toBe(0);
    expect(events[events.length - 1]).toBe(100);
  });
});
