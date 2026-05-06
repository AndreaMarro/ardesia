/**
 * drawingSync.js — Lavagna drawingPaths Supabase sync service
 *
 * Sprint T iter 28 — Bug 3 (drawingPaths cross-device persistence).
 *
 * SCOPE:
 *  - loadPaths(experimentId)               → Promise<{paths, updatedAt}|null>
 *  - savePaths(experimentId, paths)        → Promise<{success, error?}>
 *  - subscribePaths(experimentId, onChange)→ unsubscribe fn (Realtime)
 *  - debouncedSave(experimentId, paths, ms)→ schedules savePaths after delay
 *
 * Schema: see supabase/migrations/20260429120000_scribble_paths.sql
 *   table: scribble_paths(experiment_id text, user_id uuid|null,
 *                         class_key text|null, paths jsonb, updated_at)
 *
 * Conflict resolution: last-write-wins on (experiment_id, user_id) via UPSERT.
 *
 * Principio Zero V3 enforce:
 *   - Sync è OPT-IN: caller (DrawingOverlay) decides if call savePaths.
 *   - Lavagna mode → ON. Simulator standalone → OFF (caller responsibility).
 *   - When Supabase non configurato (env missing), all functions return
 *     graceful fallback, NO throw, NO retry queue (mantieni semplice iter 28).
 *
 * HONEST CAVEATS (NOT production-ready, scaffolded only):
 *   1. Migration NOT applied to remote — Andrea decide deploy via supabase db push.
 *   2. NO offline retry queue (a differenza di supabaseSync.js); failed writes
 *      are silently dropped. Andrea iter 29+ può aggiungere se serve.
 *   3. Realtime channel uses postgres_changes — vincolato da Supabase project
 *      "realtime" abilitato sulla tabella (ALTER PUBLICATION supabase_realtime
 *      ADD TABLE scribble_paths). Migration NON include questa step (Andrea OK).
 *   4. NO conflict detection: if 2 device scrivono contemporaneamente, vince
 *      l'ultimo per timestamp. CRDT merge fuori scope iter 28.
 *   5. Class-virtuale pattern: user_id nullable, row scoping al layer app via
 *      experiment_id. Multi-classe stesso experiment_id = collisione. Mitigation
 *      futura: includere class_key in unique constraint (TBD iter 29+).
 *
 * © Andrea Marro — 29/04/2026 (Sprint T iter 28)
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';

const TABLE_NAME = 'scribble_paths';
const CLASS_KEY_LS = 'elab_class_key';
const ANON_UUID_LS = 'elab_anon_uuid';

// debounce timer registry, keyed by experimentId
const debounceTimers = new Map();

// ─── Internal helpers ───

/**
 * Read class_key from localStorage. Nullable (sandbox mode = no class).
 * @returns {string|null}
 */
function _getClassKey() {
  try {
    return localStorage.getItem(CLASS_KEY_LS) || null;
  } catch {
    return null;
  }
}

/**
 * Read or create stable anon UUID for current device/user.
 * Mirrors supabaseSync._getCurrentUserId pattern.
 * @returns {string|null} UUID v4 or null if crypto unavailable
 */
function _getAnonUserId() {
  try {
    let id = localStorage.getItem(ANON_UUID_LS);
    if (!id) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
        localStorage.setItem(ANON_UUID_LS, id);
      } else {
        return null;
      }
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Normalize experimentId to a non-empty string (matches drawingStorage convention).
 * Sandbox / null → 'paths' (legacy bucket name).
 */
function _normalizeExpId(experimentId) {
  if (typeof experimentId === 'string' && experimentId.length > 0) {
    return experimentId;
  }
  return 'paths';
}

// ─── Public API ───

/**
 * Load drawing paths for an experiment from Supabase.
 *
 * @param {string|null} experimentId — experiment slug or null (→ sandbox bucket)
 * @returns {Promise<{paths: Array, updatedAt: string} | null>}
 *          null = not configured / not found / error (caller falls back to localStorage)
 */
export async function loadPaths(experimentId, sessionId = null) {
  if (!isSupabaseConfigured()) return null;

  const expId = _normalizeExpId(experimentId);
  const userId = _getAnonUserId();

  try {
    let query = supabase
      .from(TABLE_NAME)
      .select('paths, updated_at')
      .eq('experiment_id', expId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    // Sprint V iter 1 Atom A2.3 — session_id scoping (optional).
    // Quando il caller non fornisce sessionId, manteniamo backward-compat
    // matchando le righe legacy con session_id NULL.
    if (typeof sessionId === 'string' && sessionId.length > 0) {
      query = query.eq('session_id', sessionId);
    } else {
      query = query.is('session_id', null);
    }

    query = query.order('updated_at', { ascending: false }).limit(1);

    const { data, error } = await query;
    if (error) return null;
    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
      paths: Array.isArray(row.paths) ? row.paths : [],
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Save drawing paths to Supabase via upsert (last-write-wins).
 *
 * @param {string|null} experimentId — experiment slug or null (→ sandbox bucket)
 * @param {Array} paths — array of {points,color,width,isEraser}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function savePaths(experimentId, paths, sessionId = null) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase non configurato' };
  }
  if (!Array.isArray(paths)) {
    return { success: false, error: 'paths must be an array' };
  }

  const expId = _normalizeExpId(experimentId);
  const userId = _getAnonUserId();
  const classKey = _getClassKey();
  const sessId = (typeof sessionId === 'string' && sessionId.length > 0) ? sessionId : null;

  const row = {
    experiment_id: expId,
    user_id: userId,
    class_key: classKey,
    session_id: sessId,
    paths,
    updated_at: new Date().toISOString(),
  };

  try {
    // Sprint V iter 1 Atom A2.3 — onConflict include session_id per la nuova
    // unique constraint (session_id, experiment_id, user_id).
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(row, { onConflict: 'session_id,experiment_id,user_id' });
    if (error) {
      return { success: false, error: error.message || String(error) };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || String(e) };
  }
}

/**
 * Subscribe to realtime updates for a given experiment.
 * Caller must invoke the returned unsubscribe fn on unmount.
 *
 * @param {string|null} experimentId
 * @param {(payload: {paths: Array, updatedAt: string}) => void} onChange
 * @returns {() => void} unsubscribe — safe no-op if Supabase not configured
 */
export function subscribePaths(experimentId, onChange) {
  if (!isSupabaseConfigured() || typeof onChange !== 'function') {
    return () => {};
  }

  const expId = _normalizeExpId(experimentId);
  const channelName = `scribble_paths:${expId}`;

  let channel;
  try {
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLE_NAME,
          filter: `experiment_id=eq.${expId}`,
        },
        (payload) => {
          const row = payload?.new || payload?.record;
          if (!row) return;
          onChange({
            paths: Array.isArray(row.paths) ? row.paths : [],
            updatedAt: row.updated_at,
          });
        }
      )
      .subscribe();
  } catch {
    return () => {};
  }

  return () => {
    try {
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
      if (supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    } catch {
      /* ignore */
    }
  };
}

/**
 * Debounced save: schedule a savePaths call after `delayMs` of inactivity.
 * Re-invoking with the same experimentId resets the timer (latest wins).
 *
 * @param {string|null} experimentId
 * @param {Array} paths
 * @param {number} [delayMs=2000]
 * @returns {void}
 */
export function debouncedSave(experimentId, paths, delayMs = 2000, sessionId = null) {
  const expId = _normalizeExpId(experimentId);
  const sessKey = (typeof sessionId === 'string' && sessionId.length > 0) ? sessionId : '_';
  const timerKey = `${sessKey}::${expId}`;
  const prev = debounceTimers.get(timerKey);
  if (prev) clearTimeout(prev);

  const t = setTimeout(() => {
    debounceTimers.delete(timerKey);
    // fire-and-forget; caller doesn't await
    savePaths(experimentId, paths, sessionId).catch(() => { /* swallow */ });
  }, Math.max(0, delayMs));

  debounceTimers.set(timerKey, t);
}

/**
 * Cancel any pending debounced save for an experiment (e.g. on unmount).
 * @param {string|null} experimentId
 */
export function cancelDebouncedSave(experimentId, sessionId = null) {
  const expId = _normalizeExpId(experimentId);
  const sessKey = (typeof sessionId === 'string' && sessionId.length > 0) ? sessionId : '_';
  const timerKey = `${sessKey}::${expId}`;
  const prev = debounceTimers.get(timerKey);
  if (prev) {
    clearTimeout(prev);
    debounceTimers.delete(timerKey);
  }
}

/**
 * Test-only helper: clear all pending debounce timers.
 * @internal
 */
export function _clearAllDebounceTimers() {
  for (const t of debounceTimers.values()) clearTimeout(t);
  debounceTimers.clear();
}
