// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * HEX Compilation Cache — Andrea Marro — 15/02/2026
 * Cache locale per evitare ricompilazione codice identico
 *
 * Extracted from NewElabSimulator.jsx
 * Updated 31/03/2026: max 50 entries, 7-day TTL, eviction on write
 * Updated 25/05/2026 (Wave 1 Impl-C): cap reduced to 20 entries with TRUE LRU
 *   semantics. `getCachedHex` refreshes `lastAccess` on hit (MRU). Eviction on
 *   `setCachedHex` over cap removes the entry with the OLDEST `lastAccess`.
 *   Spec: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 12 item 5
 *   "HEX compile cache LRU 20 entries".
 *   Added `clearCache()` + `getCacheSize()` accessors.
 */
import logger from '../../../utils/logger';

const CACHE_KEY = 'elab_compile_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 giorni
const MAX_CACHE_ENTRIES = 20;

// Monotonic tick counter — used as LRU recency tiebreaker when multiple
// writes/reads happen within the same Date.now() millisecond. Ensures
// deterministic LRU order regardless of clock resolution.
let _lruTick = 0;
function nextTick() {
  _lruTick = (_lruTick + 1) >>> 0;
  return _lruTick;
}

/**
 * Genera hash SHA256 semplificato del codice sorgente
 * @param {string} code — codice Arduino
 * @returns {Promise<string>} — hash esadecimale
 */
export async function hashCode(code) {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Read raw cache object from localStorage (defensive parse).
 * @returns {Object} — cache obj keyed by hash, or {} on read/parse failure
 */
function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Write cache object to localStorage (defensive — swallow quota errors).
 * @param {Object} cache
 */
function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    logger.warn('[ELAB Cache] Errore scrittura cache:', e);
  }
}

/**
 * Evict expired entries (TTL) and enforce LRU cap (oldest `lastAccess` wins eviction).
 * Returns the cleaned cache object.
 */
function evictStaleEntries(cache) {
  const now = Date.now();
  // Remove expired entries (TTL based on creation `timestamp`)
  const keys = Object.keys(cache);
  for (const key of keys) {
    if (now - (cache[key]?.timestamp || 0) > CACHE_TTL_MS) {
      delete cache[key];
    }
  }
  // Enforce LRU cap: remove entries with oldest `lastAccess` until at cap.
  // Tiebreaker `tick` is monotonic — deterministic order when multiple writes
  // share the same Date.now() millisecond.
  const remaining = Object.keys(cache);
  if (remaining.length > MAX_CACHE_ENTRIES) {
    const sorted = remaining.sort((a, b) => {
      const la = cache[a]?.lastAccess || 0;
      const lb = cache[b]?.lastAccess || 0;
      if (la !== lb) return la - lb;
      return (cache[a]?.tick || 0) - (cache[b]?.tick || 0);
    });
    const toRemove = sorted.length - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[sorted[i]];
    }
  }
  return cache;
}

/**
 * Recupera HEX dalla cache se esiste e non è scaduto.
 * LRU: refresh `lastAccess` on hit so this entry moves to MRU position.
 * @param {string} hash — hash del codice
 * @returns {{hex: string, size: number}|null}
 */
export function getCachedHex(hash) {
  try {
    const cache = readCache();
    const entry = cache[hash];
    if (!entry) return null;

    // Verifica TTL (7 giorni)
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[hash];
      writeCache(cache);
      return null;
    }

    // LRU refresh: bump lastAccess to NOW + monotonic tick (MRU position).
    entry.lastAccess = Date.now();
    entry.tick = nextTick();
    cache[hash] = entry;
    writeCache(cache);

    return { hex: entry.hex, size: entry.size };
  } catch (e) {
    logger.warn('[ELAB Cache] Errore lettura cache:', e);
    return null;
  }
}

/**
 * Salva HEX nella cache con eviction LRU on write.
 * @param {string} hash — hash del codice
 * @param {string} hex — codice hex compilato
 * @param {number} size — dimensione in bytes
 */
export function setCachedHex(hash, hex, size) {
  try {
    let cache = readCache();
    const now = Date.now();
    // Set/update entry — refresh timestamp + lastAccess + monotonic tick (MRU).
    cache[hash] = {
      hex,
      size,
      timestamp: cache[hash]?.timestamp || now,
      lastAccess: now,
      tick: nextTick(),
    };
    // Evict stale + enforce LRU cap AFTER write (so the new entry doesn't get evicted)
    cache = evictStaleEntries(cache);
    writeCache(cache);
  } catch (e) {
    logger.warn('[ELAB Cache] Errore scrittura cache:', e);
  }
}

/**
 * Svuota completamente la cache (rimuove tutte le entries da localStorage).
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    logger.warn('[ELAB Cache] Errore clear cache:', e);
  }
}

/**
 * Ritorna il numero corrente di entries in cache (post-TTL filtering).
 * @returns {number}
 */
export function getCacheSize() {
  try {
    const cache = readCache();
    const now = Date.now();
    // Count only non-expired entries
    return Object.keys(cache).filter(
      k => now - (cache[k]?.timestamp || 0) <= CACHE_TTL_MS
    ).length;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Wave 1b Impl-C-2 — compile counter telemetry (in-memory, session-scoped)
// Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4 item 3
//   "Compile counter telemetry session: number compilazioni, success rate,
//    avg latency, persist Supabase via existing edge function pattern."
//
// In-memory accumulators are session-scoped. Supabase persistence is
// fire-and-forget at the call site (compiler.js wires it via fetch to
// the existing edge function pattern documented in api.js — not edited
// here per ownership).
// ─────────────────────────────────────────────────────────────

let _metrics = { count: 0, success: 0, failure: 0, totalLatencyMs: 0 };

/**
 * Record a compile event. Called fire-and-forget from compiler.js.
 * Null/undefined payloads are silently ignored.
 *
 * @param {{ success?: boolean, latencyMs?: number, ramPercent?: number|null }} payload
 */
export function recordCompileMetric(payload) {
  if (!payload || typeof payload !== 'object') return;
  _metrics.count += 1;
  if (payload.success) {
    _metrics.success += 1;
  } else {
    _metrics.failure += 1;
  }
  const lat = typeof payload.latencyMs === 'number' && Number.isFinite(payload.latencyMs)
    ? payload.latencyMs
    : 0;
  _metrics.totalLatencyMs += lat;
}

/**
 * Snapshot of session-scoped compile telemetry.
 * @returns {{ count: number, success: number, failure: number, avgLatencyMs: number }}
 */
export function getCompileMetrics() {
  const avgLatencyMs = _metrics.count > 0
    ? Math.round(_metrics.totalLatencyMs / _metrics.count)
    : 0;
  return {
    count: _metrics.count,
    success: _metrics.success,
    failure: _metrics.failure,
    avgLatencyMs,
  };
}

/**
 * Reset session-scoped telemetry. Test hook + session boundary helper.
 */
export function resetCompileMetrics() {
  _metrics = { count: 0, success: 0, failure: 0, totalLatencyMs: 0 };
}
