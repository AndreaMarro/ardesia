/**
 * compileAgentDetect.js — Iter 65 P0 Atom R4 (Public Distribution Mac-only MODIFY scope).
 *
 * Browser-side detection helper for the ELAB Compile Agent (iter 63/64 native
 * node:http server, iter 70+ Express factory on loopback `127.0.0.1:8765`).
 *
 * Responsibilities:
 *   1. Probe `GET http://localhost:8765/health` with a hard 2s timeout
 *      (AbortController). Even an HTTP 401 (token gated) is considered
 *      "available" — only network-level failure means agent_offline.
 *   2. De-dup concurrent probes via in-flight promise cache + 5s TTL on the
 *      last result, so polling UIs do not spam the agent.
 *   3. Expose a platform classifier so the HomePage banner (R5) can route
 *      Mac users to the existing installer and gracefully gate Windows /
 *      Linux until iter 67+ cross-platform ships.
 *
 * Security posture (mandate spec §4.6):
 *   - NO token storage client-side. Bearer probe is not attempted.
 *   - NO sensitive data logged. Only synthetic status fields surface.
 *   - Loopback-only target. Never falls back to non-localhost hosts.
 *
 * File ownership iter 65 rigid: ONLY this module + its sibling unit test.
 *
 * @module services/compileAgentDetect
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */

/**
 * Canonical loopback agent endpoint.
 * Iter 71-PORT-UNIFY fix (Codex Pattern V iter63 P0 finding 2026-05-16):
 * Prior 17852 was iter 65 native node:http stale value never matched iter 70+
 * Express factory (http-server.js:55 DEFAULT_AGENT_PORT=8765) NOR
 * CompileUploadButton.jsx:51 AGENT_COMPILE_UPLOAD_URL. Browser detection
 * MAI matched agent prod → R4 banner stuck "Agent not detected".
 * Unified to 8765 matching agent default + button POST URL.
 */
export const COMPILE_AGENT_PORT = 8765;
export const COMPILE_AGENT_HEALTH_URL = `http://localhost:${COMPILE_AGENT_PORT}/health`;

/** Hard ceiling for a single probe (mandate spec: 2s). */
export const DEFAULT_PROBE_TIMEOUT_MS = 2000;

/** Cache TTL for `getCompileAgentStatus()` — 5s as per spec. */
export const STATUS_CACHE_TTL_MS = 5000;

/**
 * Distribution channel metadata. Mac is the only fully supported
 * installer in iter 65; Windows + Linux land in iter 67+.
 */
const PLATFORM_TABLE = Object.freeze({
  mac: Object.freeze({
    platform: 'mac',
    detected: true,
    downloadUrl: '/scripts/setup-elab-compile-agent.sh',
    instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
    label: 'macOS',
  }),
  win: Object.freeze({
    platform: 'win',
    detected: false,
    downloadUrl: null,
    instructionsUrl: '/docs/compile-agent-windows-iter67.md',
    label: 'Windows',
  }),
  linux: Object.freeze({
    platform: 'linux',
    detected: false,
    downloadUrl: null,
    instructionsUrl: '/docs/compile-agent-linux-iter67.md',
    label: 'Linux',
  }),
  unknown: Object.freeze({
    platform: 'unknown',
    detected: false,
    downloadUrl: null,
    instructionsUrl: '/docs/compile-agent-manual-install.md',
    label: 'Sconosciuto',
  }),
});

/** Internal mutable state — module-scoped, not exported. */
const _state = {
  /** Last completed probe result + timestamp for cache hits. */
  lastResult: null,
  lastResultAt: 0,
  /** In-flight probe to dedup concurrent callers (5s TTL aligns with cache). */
  inflight: null,
  inflightStartedAt: 0,
};

/**
 * Reset internal cache + in-flight state. Test-only helper, but exported
 * so callers can force a fresh probe (e.g. after a manual install nudge).
 *
 * @returns {void}
 */
export function _resetCompileAgentDetectCache() {
  _state.lastResult = null;
  _state.lastResultAt = 0;
  _state.inflight = null;
  _state.inflightStartedAt = 0;
}

/**
 * Resolve the bound fetch implementation (allow injection for tests).
 * If the caller explicitly passes `null` (vs. omitting the field), the
 * helper respects that as "no fetch available" — useful for verifying
 * the no_fetch fallback branch without monkey-patching globals.
 *
 * @param {object} opts
 * @param {boolean} fetchImplExplicit
 * @returns {Function|null}
 */
function _resolveFetch(opts, fetchImplExplicit) {
  if (typeof opts.fetchImpl === 'function') return opts.fetchImpl;
  if (fetchImplExplicit) return null; // caller passed null on purpose
  if (typeof fetch === 'function') return fetch;
  return null;
}

/**
 * Probe the local agent. Treats HTTP 401 as "available" because the agent
 * is up and answering, only token gating is missing (which is server-side
 * concern, not a client capability).
 *
 * The probe never throws. All network/abort failures collapse into
 * `{ available: false, error: 'agent_offline' | 'timeout' | 'no_fetch' }`.
 *
 * @param {object} [opts]
 * @param {number} [opts.timeoutMs=DEFAULT_PROBE_TIMEOUT_MS] Hard timeout.
 * @param {Function} [opts.fetchImpl] Override fetch (tests).
 * @param {Function} [opts.now] Override Date.now (tests).
 * @returns {Promise<{available: boolean, port: number, version?: string, error?: string, latencyMs: number}>}
 */
export async function detectCompileAgent(opts = {}) {
  const timeoutMs = typeof opts.timeoutMs === 'number' && opts.timeoutMs > 0
    ? opts.timeoutMs
    : DEFAULT_PROBE_TIMEOUT_MS;
  const fetchImplExplicit = Object.prototype.hasOwnProperty.call(opts, 'fetchImpl') && opts.fetchImpl === null;
  const fetchImpl = _resolveFetch(opts, fetchImplExplicit);
  const now = typeof opts.now === 'function' ? opts.now : () => Date.now();

  // Dedup concurrent callers within a 5s window. If an inflight probe
  // exists and is younger than the cache TTL, await it. Otherwise we will
  // initiate a fresh one (rare: only after the previous resolved/timed out).
  if (_state.inflight && (now() - _state.inflightStartedAt) < STATUS_CACHE_TTL_MS) {
    return _state.inflight;
  }

  if (!fetchImpl) {
    const result = {
      available: false,
      port: COMPILE_AGENT_PORT,
      error: 'no_fetch',
      latencyMs: 0,
    };
    _state.lastResult = result;
    _state.lastResultAt = now();
    return result;
  }

  const startedAt = now();
  _state.inflightStartedAt = startedAt;

  const probe = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetchImpl(COMPILE_AGENT_HEALTH_URL, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        signal: controller ? controller.signal : undefined,
        headers: { 'x-elab-probe': '1' },
      });
      const latencyMs = Math.max(0, now() - startedAt);
      const status = res && typeof res.status === 'number' ? res.status : 0;

      // HTTP 401 is still "agent up" — token-gated but reachable.
      if (status === 401) {
        const result = {
          available: true,
          port: COMPILE_AGENT_PORT,
          error: undefined,
          latencyMs,
        };
        _state.lastResult = result;
        _state.lastResultAt = now();
        return result;
      }

      if (!res || !res.ok) {
        const result = {
          available: false,
          port: COMPILE_AGENT_PORT,
          error: `http_${status || 'unknown'}`,
          latencyMs,
        };
        _state.lastResult = result;
        _state.lastResultAt = now();
        return result;
      }

      // 2xx — try to read optional version. Never let body parse failure
      // downgrade the availability signal.
      let version;
      try {
        if (typeof res.json === 'function') {
          const body = await res.json();
          if (body && typeof body === 'object') {
            const v = body.version || body.agent_version || body.arduino_cli_version;
            if (typeof v === 'string' && v.trim()) version = v.trim();
          }
        }
      } catch (_) {
        // Swallow — body shape is best-effort metadata only.
      }

      const result = {
        available: true,
        port: COMPILE_AGENT_PORT,
        version,
        error: undefined,
        latencyMs,
      };
      _state.lastResult = result;
      _state.lastResultAt = now();
      return result;
    } catch (err) {
      const latencyMs = Math.max(0, now() - startedAt);
      const aborted = err && (err.name === 'AbortError' || err.code === 20);
      const result = {
        available: false,
        port: COMPILE_AGENT_PORT,
        error: aborted ? 'timeout' : 'agent_offline',
        latencyMs,
      };
      _state.lastResult = result;
      _state.lastResultAt = now();
      return result;
    } finally {
      if (timer) clearTimeout(timer);
      // Clear inflight only if it still points to this probe.
      if (_state.inflightStartedAt === startedAt) {
        _state.inflight = null;
      }
    }
  })();

  _state.inflight = probe;
  return probe;
}

/**
 * Cached agent status for UI polling. Honors a 5s TTL so a banner that
 * re-renders frequently does not flood the loopback agent. Forces a fresh
 * probe via `{ force: true }`.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.force=false] Bypass cache.
 * @param {number} [opts.timeoutMs] Override probe timeout.
 * @param {Function} [opts.fetchImpl] Test injection.
 * @param {Function} [opts.now] Test injection.
 * @returns {Promise<{available: boolean, port: number, version?: string, error?: string, latencyMs: number}>}
 */
export async function getCompileAgentStatus(opts = {}) {
  const now = typeof opts.now === 'function' ? opts.now : () => Date.now();
  if (!opts.force && _state.lastResult && (now() - _state.lastResultAt) < STATUS_CACHE_TTL_MS) {
    return _state.lastResult;
  }
  return detectCompileAgent(opts);
}

/**
 * Boolean shortcut around `getCompileAgentStatus`. Useful for conditional
 * rendering (e.g. show "Carica su Nano R4" button only if agent up).
 *
 * @param {object} [opts] Forwarded to `getCompileAgentStatus`.
 * @returns {Promise<boolean>}
 */
export async function isCompileAgentAvailable(opts = {}) {
  const status = await getCompileAgentStatus(opts);
  return !!(status && status.available);
}

/**
 * Classify the current browser platform. Mac is the only iter 65 supported
 * channel; Windows / Linux surface installer instructions slated for iter 67+.
 *
 * @param {object} [opts]
 * @param {string} [opts.platformOverride] Test injection (else reads navigator).
 * @returns {{platform: 'mac'|'win'|'linux'|'unknown', detected: boolean, downloadUrl: string|null, instructionsUrl: string, label: string}}
 */
export function getAgentInstallInstructions(opts = {}) {
  let raw;
  if (typeof opts.platformOverride === 'string') {
    raw = opts.platformOverride;
  } else if (typeof navigator !== 'undefined' && typeof navigator.platform === 'string') {
    raw = navigator.platform;
  } else {
    raw = '';
  }
  const normalized = raw.toLowerCase();

  if (normalized.includes('mac')) return { ...PLATFORM_TABLE.mac };
  if (normalized.includes('win')) return { ...PLATFORM_TABLE.win };
  if (normalized.includes('linux') || normalized.includes('x11')) {
    return { ...PLATFORM_TABLE.linux };
  }
  return { ...PLATFORM_TABLE.unknown };
}
