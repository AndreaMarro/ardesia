/**
 * uploadAgent.js — Wave 2 X.3 Atom-D unified upload facade.
 *
 * Provides a single entry point `uploadHex(hexString, opts)` that orchestrates
 * the upload chain Nano R4 kit Omaric:
 *   1. ELAB Compile Agent loopback (preferred — full arduino-cli + AVRdude path)
 *   2. Web Serial line-by-line (Chrome/Edge stub for AVR Uno-class fallback)
 *
 * Each leg can also be invoked directly for diagnostic UI:
 *   - detectCapabilities()       capability snapshot
 *   - uploadViaElabAgent()       POST hex to local agent
 *   - uploadViaWebSerial()       request port + serial drip-feed
 *
 * Security posture:
 *   - NO token storage client-side. Loopback agent is trust-on-first-use.
 *   - HTTP target is loopback only (`http://localhost:8765/upload` default,
 *     port imported from compileAgentDetect.COMPILE_AGENT_PORT). Endpoint
 *     override accepted FOR TESTS ONLY.
 *   - Web Serial requires user gesture per browser policy. Module never
 *     attempts to bypass requestPort().
 *
 * Italian user-facing errors follow Principio Zero plurale "Ragazzi,". Every
 * thrown error object carries { code, it, cause? } so the UI can branch on
 * `code` while showing the docente a friendly LIM-projected message.
 *
 * Wire-up to CompileUploadButton.jsx is deferred to iter X.3b — this module
 * is a facade only. File ownership rigid Wave 2: ONLY this file + sibling
 * unit test. No engine modifications.
 *
 * @module services/uploadAgent
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { COMPILE_AGENT_PORT, getCompileAgentStatus } from './compileAgentDetect.js';
import { detectWebUSBCapability } from './webUsbDetect.js';

/** Default loopback endpoint for the ELAB Compile Agent upload route. */
const DEFAULT_AGENT_ENDPOINT = `http://localhost:${COMPILE_AGENT_PORT}/upload`;

/** Hard ceiling for agent upload roundtrip (mandate: 30s). */
const DEFAULT_AGENT_TIMEOUT_MS = 30_000;

/** Default Web Serial baud rate for AVR Uno-class boards. */
const DEFAULT_BAUD_RATE = 115_200;

/** Italian message bundle — plurale "Ragazzi," per Principio Zero. */
const IT_MESSAGES = Object.freeze({
  agent_offline: 'Ragazzi, ELAB Agent non risponde. Provo via Web Serial.',
  agent_timeout: 'Ragazzi, ELAB Agent ha impiegato troppo. Riprovo via Web Serial.',
  agent_http_status: 'Ragazzi, ELAB Agent ha risposto con un errore.',
  agent_network: 'Ragazzi, ELAB Agent non risponde. Provo via Web Serial.',
  web_serial_unsupported: 'Ragazzi, Web Serial non e supportato dal browser. Aprite Chrome o Edge.',
  web_serial_failed: 'Ragazzi, il caricamento via Web Serial non e riuscito. Provate di nuovo.',
  no_upload_method: 'Ragazzi, attivate ELAB Agent oppure aprite Chrome/Edge con Web Serial per caricare sul kit.',
});

/**
 * Build a structured upload error. Always carries Italian text plus a
 * stable `code` for branching.
 *
 * @param {string} code
 * @param {Error} [cause]
 * @returns {Error & {code:string, it:string, cause?:Error}}
 */
function makeUploadError(code, cause) {
  const it = IT_MESSAGES[code] || IT_MESSAGES.no_upload_method;
  const err = new Error(`[uploadAgent:${code}] ${it}`);
  err.code = code;
  err.it = it;
  if (cause) err.cause = cause;
  return err;
}

/**
 * Resolve injected fetch implementation. Test-only `null` returns null.
 *
 * @param {object} opts
 * @returns {Function|null}
 */
function resolveFetchImpl(opts) {
  if (Object.prototype.hasOwnProperty.call(opts, 'fetchImpl')) {
    return typeof opts.fetchImpl === 'function' ? opts.fetchImpl : null;
  }
  return typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;
}

/**
 * Resolve the Web Serial implementation. Tests inject via `opts.serialImpl`,
 * production reads `navigator.serial`. Returns null if neither.
 *
 * @param {object} opts
 * @returns {object|null}
 */
function resolveSerialImpl(opts) {
  if (opts && opts.serialImpl) return opts.serialImpl;
  if (typeof navigator !== 'undefined' && navigator && navigator.serial) {
    return navigator.serial;
  }
  return null;
}

/**
 * Combine the caller's AbortSignal (if any) with a fresh timeout controller.
 * Returns { signal, cancel } — call `cancel()` once the work completes to
 * clear the timer.
 *
 * @param {AbortSignal|undefined} callerSignal
 * @param {number} timeoutMs
 * @returns {{ signal: AbortSignal|undefined, cancel: Function, didTimeout: () => boolean }}
 */
function buildTimeoutSignal(callerSignal, timeoutMs) {
  if (typeof AbortController === 'undefined') {
    return { signal: callerSignal, cancel: () => {}, didTimeout: () => false };
  }
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  if (callerSignal) {
    if (callerSignal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
    didTimeout: () => timedOut,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Capability snapshot for the upload chain. Synchronous from the caller's
 * point of view conceptually (returns a Promise because the ELAB Agent probe
 * is async). Pure — no side effects beyond reading navigator + probing the
 * cached agent status.
 *
 * @param {object} [opts]
 * @param {Function} [opts.fetchImpl] Inject fetch for the agent probe (tests).
 * @returns {Promise<{elabAgent: boolean, webSerial: boolean, webUsb: boolean}>}
 */
export async function detectCapabilities(opts = {}) {
  let elabAgent = false;
  try {
    const status = await getCompileAgentStatus(opts);
    elabAgent = !!(status && status.available);
  } catch (_) {
    elabAgent = false;
  }

  const webSerial = typeof navigator !== 'undefined'
    && navigator !== null
    && typeof navigator === 'object'
    && 'serial' in navigator
    && navigator.serial != null;

  let webUsb = false;
  try {
    const cap = detectWebUSBCapability();
    webUsb = !!(cap && cap.webUsbAvailable);
  } catch (_) {
    webUsb = false;
  }

  return { elabAgent, webSerial, webUsb };
}

/**
 * Upload a HEX string via the local ELAB Compile Agent. POSTs JSON to the
 * canonical `/upload` endpoint on loopback:8765 (port imported from
 * `compileAgentDetect.COMPILE_AGENT_PORT` — never duplicated here).
 *
 * Progress reporting is coarse — `onProgress(0)` at start, `onProgress(100)`
 * on success. Mid-upload streaming is a server concern not surfaced today.
 *
 * @param {string} hexString Intel HEX payload as text.
 * @param {object} opts
 * @param {string} opts.port Serial port path (e.g. `/dev/cu.usbmodem1234`).
 * @param {string} [opts.boardId='arduino-nano-r4'] FQBN slug.
 * @param {AbortSignal} [opts.signal] Caller cancellation.
 * @param {Function} [opts.onProgress] Progress callback (number 0..100).
 * @param {Function} [opts.fetchImpl] Test injection (defaults globalThis.fetch).
 * @param {string} [opts.endpoint] Override the upload endpoint (tests only).
 * @param {number} [opts.timeoutMs=DEFAULT_AGENT_TIMEOUT_MS] Hard timeout.
 * @returns {Promise<{ok: true, msg: 'agent_ok', data: any}>}
 * @throws {{code: 'agent_offline'|'agent_timeout'|'agent_http_status'|'agent_network', it: string}}
 */
export async function uploadViaElabAgent(hexString, opts = {}) {
  const fetchImpl = resolveFetchImpl(opts);
  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
  const endpoint = typeof opts.endpoint === 'string' && opts.endpoint
    ? opts.endpoint
    : DEFAULT_AGENT_ENDPOINT;
  const timeoutMs = typeof opts.timeoutMs === 'number' && opts.timeoutMs > 0
    ? opts.timeoutMs
    : DEFAULT_AGENT_TIMEOUT_MS;
  const boardId = typeof opts.boardId === 'string' && opts.boardId
    ? opts.boardId
    : 'arduino-nano-r4';

  if (!fetchImpl) {
    throw makeUploadError('agent_offline');
  }

  if (onProgress) {
    try { onProgress(0); } catch (_) { /* user callback isolation */ }
  }

  const { signal, cancel, didTimeout } = buildTimeoutSignal(opts.signal, timeoutMs);

  let res;
  try {
    res = await fetchImpl(endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hex: hexString, port: opts.port, boardId }),
      signal,
    });
  } catch (err) {
    cancel();
    if (didTimeout() || (err && err.name === 'AbortError')) {
      throw makeUploadError('agent_timeout', err);
    }
    if (err && (err instanceof TypeError || /fetch/i.test(err.message || ''))) {
      throw makeUploadError('agent_network', err);
    }
    throw makeUploadError('agent_network', err);
  } finally {
    cancel();
  }

  if (!res || !res.ok) {
    const status = res && typeof res.status === 'number' ? res.status : 0;
    const httpErr = makeUploadError('agent_http_status');
    httpErr.status = status;
    throw httpErr;
  }

  let data;
  try {
    if (typeof res.json === 'function') {
      data = await res.json();
    }
  } catch (_) {
    // Body parse failure is non-fatal — agent reported 2xx.
    data = undefined;
  }

  if (onProgress) {
    try { onProgress(100); } catch (_) { /* isolate */ }
  }

  return { ok: true, msg: 'agent_ok', data };
}

/**
 * Upload via Web Serial line-by-line write.
 *
 * STUB for AVR Uno-class boards. Nano R4 uses WebUSB DFU (see webUsbDetect
 * + webDfuFlash modules) — this path remains the legacy fallback when the
 * ELAB Compile Agent is offline AND the board is an Uno-class device. The
 * implementation drip-feeds the HEX text line-by-line so a future bootloader
 * adapter can layer STK500 / optiboot framing on top.
 *
 * @param {string} hexString Intel HEX payload as text.
 * @param {object} [opts]
 * @param {number} [opts.baudRate=115200]
 * @param {AbortSignal} [opts.signal] Caller cancellation.
 * @param {Function} [opts.onProgress] Progress callback (number 0..100).
 * @param {object} [opts.serialImpl] Test injection (defaults navigator.serial).
 * @returns {Promise<{ok: true, msg: 'webserial_ok', lines: number}>}
 * @throws {{code: 'web_serial_unsupported'|'web_serial_failed', it: string, cause?: Error}}
 */
export async function uploadViaWebSerial(hexString, opts = {}) {
  const serialImpl = resolveSerialImpl(opts);
  if (!serialImpl || typeof serialImpl.requestPort !== 'function') {
    throw makeUploadError('web_serial_unsupported');
  }

  const baudRate = typeof opts.baudRate === 'number' && opts.baudRate > 0
    ? opts.baudRate
    : DEFAULT_BAUD_RATE;
  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

  const lines = String(hexString || '').split(/\r?\n/).filter((l) => l.length > 0);
  const total = lines.length;

  let port;
  let writer;
  try {
    port = await serialImpl.requestPort();
    await port.open({ baudRate });

    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    writer = port.writable.getWriter();

    if (onProgress) {
      try { onProgress(0); } catch (_) { /* isolate */ }
    }

    for (let i = 0; i < total; i++) {
      if (opts.signal && opts.signal.aborted) {
        throw new Error('aborted_by_caller');
      }
      const line = lines[i] + '\n';
      const chunk = encoder ? encoder.encode(line) : line;
      await writer.write(chunk);

      if (onProgress) {
        const pct = total === 0 ? 100 : Math.floor(((i + 1) / total) * 100);
        try { onProgress(pct); } catch (_) { /* isolate */ }
      }
    }

    if (onProgress) {
      try { onProgress(100); } catch (_) { /* isolate */ }
    }
  } catch (err) {
    // Attempt graceful cleanup before re-throwing.
    try { if (writer) await writer.close(); } catch (_) { /* swallow */ }
    try { if (writer && typeof writer.releaseLock === 'function') writer.releaseLock(); } catch (_) { /* swallow */ }
    try { if (port && typeof port.close === 'function') await port.close(); } catch (_) { /* swallow */ }
    throw makeUploadError('web_serial_failed', err);
  }

  try { await writer.close(); } catch (_) { /* swallow */ }
  try { if (typeof writer.releaseLock === 'function') writer.releaseLock(); } catch (_) { /* swallow */ }
  try { await port.close(); } catch (_) { /* swallow */ }

  return { ok: true, msg: 'webserial_ok', lines: total };
}

/**
 * Orchestrate the upload with explicit fallback chain:
 *   1. ELAB Agent (if available)
 *   2. Web Serial (if available)
 *   3. Throw `no_upload_method` with `tried` audit list.
 *
 * Progress aggregation is path-aware: only the path that ultimately wins
 * reports 0..100 to the caller. A failed first-leg does NOT bleed into the
 * fallback's progress stream (caller sees a clean 0..100 for the winner).
 *
 * @param {string} hexString Intel HEX payload as text.
 * @param {object} [opts]
 * @param {string} [opts.port] Serial port path (forwarded to ElabAgent path).
 * @param {string} [opts.boardId] FQBN slug (forwarded).
 * @param {AbortSignal} [opts.signal] Caller cancellation.
 * @param {Function} [opts.onProgress] Progress callback (number 0..100).
 * @param {Function} [opts.fetchImpl] Inject fetch (tests).
 * @param {object} [opts.serialImpl] Inject Web Serial impl (tests).
 * @param {string} [opts.agentEndpoint] Override agent endpoint (tests).
 * @returns {Promise<{ok: true, msg: string, data?: any, lines?: number}>}
 * @throws {{code: 'no_upload_method', it: string, tried: string[]}}
 */
export async function uploadHex(hexString, opts = {}) {
  const tried = [];
  const errors = [];

  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

  // ── Leg 1: ELAB Compile Agent ───────────────────────────────────────────
  // We attempt this unconditionally when a fetch impl is reachable — even
  // if `detectCapabilities` reported elabAgent=false, the probe may have
  // been stale. The agent call itself enforces a hard timeout so a real
  // outage degrades quickly.
  const fetchImpl = resolveFetchImpl(opts);
  if (fetchImpl) {
    tried.push('elab_agent');
    try {
      const res = await uploadViaElabAgent(hexString, {
        port: opts.port,
        boardId: opts.boardId,
        signal: opts.signal,
        onProgress,
        fetchImpl,
        endpoint: opts.agentEndpoint,
      });
      return res;
    } catch (err) {
      errors.push({ leg: 'elab_agent', code: err && err.code, cause: err });
      // Fall through to leg 2.
    }
  }

  // ── Leg 2: Web Serial ──────────────────────────────────────────────────
  const serialImpl = resolveSerialImpl(opts);
  if (serialImpl) {
    tried.push('web_serial');
    try {
      const res = await uploadViaWebSerial(hexString, {
        signal: opts.signal,
        onProgress,
        serialImpl,
      });
      return res;
    } catch (err) {
      errors.push({ leg: 'web_serial', code: err && err.code, cause: err });
    }
  } else if (!tried.includes('web_serial')) {
    // Record that the path was not even attempted (no impl) for the audit.
    tried.push('web_serial');
  }

  const failure = makeUploadError('no_upload_method');
  failure.tried = tried;
  failure.attempts = errors;
  throw failure;
}
