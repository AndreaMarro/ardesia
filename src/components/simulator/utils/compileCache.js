// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * HEX Compilation Cache — Andrea Marro — 15/02/2026
 * Cache locale per evitare ricompilazione codice identico
 *
 * Extracted from NewElabSimulator.jsx
 * Updated 31/03/2026: max 50 entries, 7-day TTL, eviction on write
 */
import logger from '../../../utils/logger';

const CACHE_KEY = 'elab_compile_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 giorni
const MAX_CACHE_ENTRIES = 50;

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
 * Evict expired entries and enforce max entries cap.
 * Returns the cleaned cache object.
 */
function evictStaleEntries(cache) {
  const now = Date.now();
  // Remove expired entries
  const keys = Object.keys(cache);
  for (const key of keys) {
    if (now - (cache[key]?.timestamp || 0) > CACHE_TTL_MS) {
      delete cache[key];
    }
  }
  // Enforce max entries: remove oldest if over cap
  const remaining = Object.keys(cache);
  if (remaining.length > MAX_CACHE_ENTRIES) {
    const sorted = remaining.sort((a, b) => (cache[a]?.timestamp || 0) - (cache[b]?.timestamp || 0));
    const toRemove = sorted.length - MAX_CACHE_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      delete cache[sorted[i]];
    }
  }
  return cache;
}

/**
 * Recupera HEX dalla cache se esiste e non è scaduto
 * @param {string} hash — hash del codice
 * @returns {{hex: string, size: number}|null}
 */
export function getCachedHex(hash) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[hash];
    if (!entry) return null;

    // Verifica TTL (7 giorni)
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[hash];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return { hex: entry.hex, size: entry.size };
  } catch (e) {
    logger.warn('[ELAB Cache] Errore lettura cache:', e);
    return null;
  }
}

/**
 * Salva HEX nella cache con eviction on write
 * @param {string} hash — hash del codice
 * @param {string} hex — codice hex compilato
 * @param {number} size — dimensione in bytes
 */
export function setCachedHex(hash, hex, size) {
  try {
    let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    // Evict stale + enforce cap BEFORE adding new entry
    cache = evictStaleEntries(cache);
    cache[hash] = { hex, size, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    logger.warn('[ELAB Cache] Errore scrittura cache:', e);
  }
}
