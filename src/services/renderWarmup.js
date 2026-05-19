// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * renderWarmup.js — T1-003 Render cold start warmup scheduler (client-side).
 * Pings RENDER_HEALTH_URL every DEFAULT_INTERVAL_MS to keep the Render
 * Nanobot warm (~18s cold start -> <3s TTFT target). Emits warmup:success
 * and warmup:failure events, with retry-backoff on 503 and a cooldown
 * window to suppress over-eager pings.
 *
 * @module services/renderWarmup
 */

export const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;
export const DEFAULT_COOLDOWN_MS = 30 * 1000;
export const DEFAULT_TIMEOUT_MS = 10 * 1000;
export const DEFAULT_MAX_RETRIES = 2;
export const DEFAULT_RETRY_BASE_MS = 1000;

const readEnvUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const v = import.meta.env.VITE_RENDER_HEALTH_URL;
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  } catch (_) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.RENDER_HEALTH_URL) {
      return String(process.env.RENDER_HEALTH_URL).trim();
    }
  } catch (_) {}
  return 'https://elab-galileo.onrender.com/health';
};

/**
 * One-shot health ping. Returns { ok, status?, error? }.
 * @param {string} url
 * @param {{ fetchImpl?: Function, timeoutMs?: number }} opts
 */
export async function warmupOnce(url, opts = {}) {
  const fetchImpl = opts.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) return { ok: false, error: 'no-fetch' };
  const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetchImpl(url, {
      method: 'GET',
      signal: controller ? controller.signal : undefined,
      headers: { 'x-warmup': '1' },
    });
    const status = res && typeof res.status === 'number' ? res.status : 0;
    const ok = !!(res && res.ok);
    return { ok, status };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Create a warmup scheduler with start/stop and event emitter.
 * @param {object} cfg
 * @param {string} [cfg.url]
 * @param {number} [cfg.intervalMs]
 * @param {number} [cfg.cooldownMs]
 * @param {number} [cfg.timeoutMs]
 * @param {number} [cfg.maxRetries]
 * @param {number} [cfg.retryBaseMs]
 * @param {boolean} [cfg.initialPing]
 * @param {Function} [cfg.fetchImpl]
 */
export function createWarmupScheduler(cfg = {}) {
  const url = (cfg.url != null ? cfg.url : readEnvUrl());
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('createWarmupScheduler: url required');
  }
  const intervalMs = cfg.intervalMs || DEFAULT_INTERVAL_MS;
  const cooldownMs = typeof cfg.cooldownMs === 'number' ? cfg.cooldownMs : DEFAULT_COOLDOWN_MS;
  const timeoutMs = cfg.timeoutMs || DEFAULT_TIMEOUT_MS;
  const maxRetries = typeof cfg.maxRetries === 'number' ? cfg.maxRetries : DEFAULT_MAX_RETRIES;
  const retryBaseMs = cfg.retryBaseMs || DEFAULT_RETRY_BASE_MS;
  const initialPing = cfg.initialPing !== false;
  const fetchImpl = cfg.fetchImpl || (typeof fetch === 'function' ? fetch : null);

  const listeners = new Map();
  let intervalHandle = null;
  let running = false;
  let lastPingAt = 0;

  const emit = (event, payload) => {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of set) {
      try { fn(payload); } catch (_) {}
    }
  };

  const on = (event, fn) => {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
  };

  const off = (event, fn) => {
    const set = listeners.get(event);
    if (set) set.delete(fn);
  };

  const pingOnceWithRetry = async (attempt = 0) => {
    const res = await warmupOnce(url, { fetchImpl, timeoutMs });
    if (res.ok) {
      emit('warmup:success', { url, status: res.status, at: Date.now() });
      return res;
    }
    emit('warmup:failure', { url, status: res.status, error: res.error, at: Date.now(), attempt });
    if (attempt + 1 < maxRetries) {
      const delay = retryBaseMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return pingOnceWithRetry(attempt + 1);
    }
    return res;
  };

  const tick = async () => {
    const now = Date.now();
    if (now - lastPingAt < cooldownMs) return;
    lastPingAt = now;
    await pingOnceWithRetry(0);
  };

  const start = () => {
    if (running) return;
    running = true;
    if (initialPing) tick();
    intervalHandle = setInterval(tick, intervalMs);
  };

  const stop = () => {
    running = false;
    if (intervalHandle) { clearInterval(intervalHandle); intervalHandle = null; }
  };

  const isRunning = () => running;

  return { start, stop, on, off, isRunning, url, intervalMs, cooldownMs };
}
