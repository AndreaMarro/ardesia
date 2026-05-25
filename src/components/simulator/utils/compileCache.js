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
  // Enforce LRU cap: remove entries with oldest `lastAccess` until at cap
  const remaining = Object.keys(cache);
  if (remaining.length > MAX_CACHE_ENTRIES) {
    const sorted = remaining.sort(
      (a, b) => (cache[a]?.lastAccess || 0) - (cache[b]?.lastAccess || 0)
    );
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

    // LRU refresh: bump lastAccess to NOW (MRU position)
    entry.lastAccess = Date.now();
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
    // Set/update entry — refresh both timestamp + lastAccess (MRU)
    cache[hash] = { hex, size, timestamp: cache[hash]?.timestamp || now, lastAccess: now };
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
