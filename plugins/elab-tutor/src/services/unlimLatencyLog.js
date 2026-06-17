// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * unlimLatencyLog.js — lightweight ring-buffer latency logger for UNLIM chat.
 *
 * Sprint-3 Day 05 (T1-003 carryover, Option B no-npm constraint).
 *
 * Design:
 *   - 50-entry ring buffer in localStorage, FIFO on overflow.
 *   - Read-only consumer for future Supabase pipe (sprint-4).
 *   - No mutation of UNLIM chat flow — consumers call logLatency() side-effect.
 *   - Schema v1 frozen (versioned for migration).
 *
 * API:
 *   logLatency({ latency_ms, ok, cold_start?, query_hash?, timestamp? })
 *   getRecentLatencies({ limit? }) → array (newest last)
 *   clearLog()
 *   getStats() → { count, p50, p95, ok_rate, cold_start_count }
 */

export const STORAGE_KEY = 'unlim_latency_log';
export const SCHEMA_VERSION = 1;
export const MAX_ENTRIES = 50;

const isBrowser = () =>
  typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';

function readRaw() {
  if (!isBrowser()) return { version: SCHEMA_VERSION, entries: [] };
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: SCHEMA_VERSION, entries: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.entries)) {
      return { version: SCHEMA_VERSION, entries: [] };
    }
    return { version: parsed.version || 1, entries: parsed.entries };
  } catch {
    return { version: SCHEMA_VERSION, entries: [] };
  }
}

function writeRaw(data) {
  if (!isBrowser()) return false;
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const latency_ms = Number(entry.latency_ms);
  if (!Number.isFinite(latency_ms) || latency_ms < 0) return null;
  return {
    timestamp: entry.timestamp || new Date().toISOString(),
    latency_ms,
    ok: Boolean(entry.ok),
    cold_start: Boolean(entry.cold_start),
    query_hash: typeof entry.query_hash === 'string' ? entry.query_hash.slice(0, 16) : ''
  };
}

export function logLatency(entry) {
  const normalized = validateEntry(entry);
  if (!normalized) return false;
  const data = readRaw();
  data.entries.push(normalized);
  if (data.entries.length > MAX_ENTRIES) {
    data.entries = data.entries.slice(-MAX_ENTRIES);
  }
  data.version = SCHEMA_VERSION;
  return writeRaw(data);
}

export function getRecentLatencies({ limit = MAX_ENTRIES } = {}) {
  const data = readRaw();
  const n = Math.min(Math.max(0, Number(limit) || 0), MAX_ENTRIES);
  return data.entries.slice(-n);
}

export function clearLog() {
  if (!isBrowser()) return false;
  try {
    globalThis.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.floor((p / 100) * sortedArr.length));
  return sortedArr[idx];
}

export function getStats() {
  const entries = readRaw().entries;
  if (entries.length === 0) {
    return { count: 0, p50: 0, p95: 0, ok_rate: 0, cold_start_count: 0 };
  }
  const latencies = entries.map((e) => e.latency_ms).sort((a, b) => a - b);
  const oks = entries.filter((e) => e.ok).length;
  const colds = entries.filter((e) => e.cold_start).length;
  return {
    count: entries.length,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    ok_rate: oks / entries.length,
    cold_start_count: colds
  };
}
