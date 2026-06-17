// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * sessionRestore — Iter 36 SessionSave Atom SS5
 *
 * Orchestra il ripristino di una sessione salvata: dato un sessionId (UUID
 * Supabase) o un experimentId locale, recupera il payload e dispatcha l'evento
 * 'elab-session-restore' che LavagnaShell consuma per:
 *   1. Caricare l'esperimento (api.loadExperiment)
 *   2. Restaurare modalità (lavagna libera / passo passo / etc.)
 *   3. Ripristinare drawing paths (drawingSync.loadDrawing)
 *   4. Restaurare chatHistory + intentHistory (UNLIM context)
 *
 * Edge cases handled:
 *   - sessionId mancante o non-string → error
 *   - record Supabase non trovato (404) → fallback localStorage
 *   - record malformato (payload sparso) → restore best-effort, log warnings
 *   - Supabase non configurato → solo localStorage path
 *   - studentId/classKey non corrisponde → comunque permette restore (modello
 *     "classe virtuale" condiviso)
 *
 * Andrea Marro — 04/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';
import logger from '../utils/logger';

const SESSIONS_KEY = 'elab_unlim_sessions';
const RESUME_EVENT = 'elab-session-restore';
const RESUME_DEEPLINK_KEY = 'elab_resume_experiment';

/**
 * Recupera il record sessione completo da Supabase (server-side) oppure
 * fallback localStorage. Ritorna null se non trovato.
 *
 * @param {string} sessionId — UUID Supabase oppure id locale
 * @returns {Promise<object|null>}
 */
export async function fetchSessionRecord(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return null;
  const id = sessionId.trim();
  if (!id) return null;

  // 1. Try Supabase if UUID format
  const isUuid = /^[0-9a-f-]{8,}$/i.test(id);
  if (isUuid && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('unlim_sessions')
        .select('id, experiment_id, modalita, started_at, ended_at, events, description_unlim, current_volume, current_volume_page')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return _normalizeSupabaseRecord(data);
    } catch (err) {
      logger.warn('[Restore] Supabase fetch failed, fallback local:', err?.message || err);
    }
  }

  // 2. Fallback localStorage (lookup by id OR experimentId)
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const match = parsed.find((s) => s && (s.id === id || s.experimentId === id));
    return match || null;
  } catch {
    return null;
  }
}

function _normalizeSupabaseRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    experimentId: row.experiment_id,
    modalita: row.modalita || 'percorso',
    startTime: row.started_at,
    endTime: row.ended_at,
    description_unlim: row.description_unlim || null,
    currentVolume: row.current_volume || null,
    currentVolumePage: row.current_volume_page || null,
    // Supabase row stores `events` (jsonb). Caller may treat as actions log.
    actions: Array.isArray(row.events) ? row.events : [],
    messages: [],
    drawingPaths: null,
  };
}

/**
 * Estrae da un record sessione il payload normalizzato per il restore event.
 * @param {object} record
 * @returns {object} payload
 */
export function buildRestorePayload(record) {
  if (!record || typeof record !== 'object') return null;
  return {
    sessionId: record.id || null,
    experimentId: record.experimentId || record.experiment_id || null,
    modalita: record.modalita || record.mode || 'percorso',
    currentVolume: record.currentVolume || record.volume || null,
    currentVolumePage: record.currentVolumePage || record.page || null,
    drawingPaths: Array.isArray(record.drawingPaths) ? record.drawingPaths : null,
    chatHistory: Array.isArray(record.messages) ? record.messages : [],
    intentHistory: Array.isArray(record.actions) ? record.actions : [],
    description: record.description_unlim || null,
  };
}

/**
 * Esegue il restore di una sessione salvata.
 * Step:
 *   1. fetchSessionRecord(sessionId)
 *   2. Se non trovato → success=false con error
 *   3. Se trovato → buildRestorePayload + dispatch 'elab-session-restore'
 *   4. Imposta `elab_resume_experiment` localStorage per deep-link
 *   5. Ritorna {success, payload, error?}
 *
 * Il consumer (LavagnaShell) ascolta l'evento e chiama:
 *   - api.loadExperiment(experimentId)
 *   - setModalita(modalita)
 *   - drawingSync.loadDrawing(drawingPaths) se presente
 *
 * @param {string} sessionId
 * @returns {Promise<{success: boolean, payload?: object, error?: string}>}
 */
export async function restoreSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return { success: false, error: 'sessionId required' };
  }

  let record;
  try {
    record = await fetchSessionRecord(sessionId);
  } catch (err) {
    return { success: false, error: err?.message || 'fetch_failed' };
  }

  if (!record) {
    return { success: false, error: 'session_not_found' };
  }

  const payload = buildRestorePayload(record);
  if (!payload || !payload.experimentId) {
    return { success: false, error: 'malformed_record' };
  }

  // Persist deep-link target for cross-route restore (HomePage → Lavagna)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(RESUME_DEEPLINK_KEY, payload.experimentId);
    }
  } catch { /* best effort */ }

  // Dispatch event for LavagnaShell to consume
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent(RESUME_EVENT, { detail: payload }));
    }
  } catch (err) {
    logger.warn('[Restore] dispatch failed:', err?.message || err);
  }

  return { success: true, payload };
}

/**
 * Subscribe helper for components that want to react to restore events.
 * @param {(payload: object) => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeToRestore(handler) {
  if (typeof window === 'undefined' || typeof handler !== 'function') {
    return () => {};
  }
  const wrapped = (ev) => handler(ev?.detail || null);
  window.addEventListener(RESUME_EVENT, wrapped);
  return () => window.removeEventListener(RESUME_EVENT, wrapped);
}

export const __test__ = {
  RESUME_EVENT,
  RESUME_DEEPLINK_KEY,
};
