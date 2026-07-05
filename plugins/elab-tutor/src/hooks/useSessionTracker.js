/**
 * useSessionTracker — Traccia sessioni UNLIM strutturate
 * Registra messaggi, azioni, errori per ogni esperimento.
 * Salva in localStorage al cambio esperimento o chiusura tab.
 * © Andrea Marro — 28/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { getLessonPath } from '../../../../packs/elab-tutor/data/lesson-paths';
import { saveSession as syncSessionToSupabase } from '../services/supabaseSync';
import gamification from '../services/gamificationService';

const SESSIONS_KEY = 'elab_unlim_sessions';
const MAX_SESSIONS = 20;
const MAX_MESSAGES_PER_SESSION = 100;
const MAX_ACTIONS_PER_SESSION = 200;
const MAX_ERRORS_PER_SESSION = 50;

// ─── localStorage helpers ────────────────────────────────────────────

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch { return []; }
}

function saveSessions(sessions) {
  try {
    // Keep only last MAX_SESSIONS
    const trimmed = sessions.slice(-MAX_SESSIONS);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  } catch { /* localStorage full — silent */ }
}

// 2026-05-06 Bug #5: snapshot dei disegni della lavagna nel record di sessione.
// Legge i due localStorage bucket usati dalle lavagne ELAB:
//   - elab_wb_<expId>      → WhiteboardOverlay (canvas raster + vector elements)
//   - elab-drawing-<expId> → DrawingOverlay (SVG paths sopra il circuito)
// Quando l'esperimento è "lobby" o vuoto si usano i bucket fallback (sandbox/paths).
function snapshotDrawings(experimentId) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const wbKey = experimentId && experimentId !== 'lobby'
      ? `elab_wb_${experimentId}`
      : 'elab_wb_sandbox';
    const svgKey = experimentId && experimentId !== 'lobby'
      ? `elab-drawing-${experimentId}`
      : 'elab-drawing-paths';
    const whiteboard = localStorage.getItem(wbKey);
    const svgPaths = localStorage.getItem(svgKey);
    if (!whiteboard && !svgPaths) return null;
    return {
      whiteboard: whiteboard || null,
      svgPaths: svgPaths || null,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Session summary builder (deterministic, no AI) ──────────────────

function buildSessionSummary(session) {
  const path = getLessonPath(session.experimentId);
  const title = path?.title || session.experimentId;
  const msgCount = session.messages.length;
  const errCount = session.errors.length;
  const durationMin = session.endTime
    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)
    : 0;

  const concepts = path?.session_save?.concepts_covered || [];
  const conceptStr = concepts.length > 0 ? ` Concetti: ${concepts.join(', ')}.` : '';
  const errStr = errCount > 0 ? ` ${errCount} errori registrati.` : ' Nessun errore.';

  return `${title} — ${durationMin} min, ${msgCount} messaggi.${errStr}${conceptStr}`;
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * @returns {{ recordMessage, recordAction, recordError, getSessions, getLastSession }}
 */
export function useSessionTracker() {
  const sessionRef = useRef(null);
  const experimentIdRef = useRef(null);

  // Finalise and save the current session
  const finaliseSession = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    s.endTime = new Date().toISOString();
    s.summary = buildSessionSummary(s);
    // 2026-05-06 Bug #5: includi i disegni della lavagna nel record sessione.
    s.drawings = snapshotDrawings(s.experimentId);

    // Append or replace (dedup — visibilitychange may have saved a snapshot already)
    const sessions = loadSessions();
    const idx = sessions.findIndex(x => x.id === s.id);
    if (idx >= 0) sessions[idx] = s;
    else sessions.push(s);
    saveSessions(sessions);

    // Also update unlimMemory experiment tracking
    if (window.__unlimMemory) {
      window.__unlimMemory.trackExperimentCompletion(s.experimentId, 'success');
      window.__unlimMemory.saveSessionSummary(s.summary);
    }

    // Gamification: award points + confetti + sound
    try { gamification.onExperimentCompleted(s.experimentId); } catch { /* silent */ }

    // Sync to Supabase (async, non-blocking — errors are queued by supabaseSync)
    syncSessionToSupabase(s).catch(() => { /* queued silently by supabaseSync */ });

    sessionRef.current = null;
  }, []);

  // Start a new session for an experiment
  const startSession = useCallback((experimentId) => {
    if (!experimentId) return;
    // Finalise previous session if any
    if (sessionRef.current && sessionRef.current.experimentId !== experimentId) {
      finaliseSession();
    }
    // Don't restart if same experiment
    if (sessionRef.current?.experimentId === experimentId) return;

    experimentIdRef.current = experimentId;
    sessionRef.current = {
      id: `sess_${Date.now()}_${experimentId}`,
      experimentId,
      startTime: new Date().toISOString(),
      endTime: null,
      messages: [],
      actions: [],
      errors: [],
      summary: '',
    };
  }, [finaliseSession]);

  // Record a message (question or answer)
  // Auto-creates a "lobby" session if no experiment is loaded yet
  const recordMessage = useCallback((role, text) => {
    if (!sessionRef.current && text) {
      startSession('lobby');
    }
    const s = sessionRef.current;
    if (!s || !text) return;
    if (s.messages.length >= MAX_MESSAGES_PER_SESSION) return;
    s.messages.push({
      role, // 'user' | 'assistant'
      text: text.slice(0, 500), // cap text length
      timestamp: new Date().toISOString(),
    });
  }, [startSession]);

  // Record an action (experiment loaded, play, highlight, etc.)
  const recordAction = useCallback((type, detail) => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.actions.length >= MAX_ACTIONS_PER_SESSION) return;
    s.actions.push({
      type,
      detail: typeof detail === 'string' ? detail.slice(0, 200) : String(detail || ''),
      timestamp: new Date().toISOString(),
    });
  }, []);

  // Record an error (LED reversed, short circuit, etc.)
  const recordError = useCallback((type, detail) => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.errors.length >= MAX_ERRORS_PER_SESSION) return;
    s.errors.push({
      type,
      detail: typeof detail === 'string' ? detail.slice(0, 200) : String(detail || ''),
      timestamp: new Date().toISOString(),
    });
    // Also track in unlimMemory for aggregated mistake patterns
    if (window.__unlimMemory) {
      window.__unlimMemory.trackMistake(type, detail);
    }
  }, []);

  // Listen to experimentChange → start/end sessions
  useEffect(() => {
    function handleExpChange(data) {
      if (data?.experimentId) {
        startSession(data.experimentId);
        recordAction('experiment_loaded', data.experimentId);
      }
    }

    function trySubscribe() {
      const api = window.__ELAB_API;
      if (!api?.on) return false;
      api.on('experimentChange', handleExpChange);
      return true;
    }

    if (!trySubscribe()) {
      const timer = setTimeout(trySubscribe, 800);
      return () => {
        clearTimeout(timer);
        const api = window.__ELAB_API;
        if (api?.off) api.off('experimentChange', handleExpChange);
      };
    }

    return () => {
      const api = window.__ELAB_API;
      if (api?.off) api.off('experimentChange', handleExpChange);
    };
  }, [startSession, recordAction]);

  // Save session on tab close / visibility change
  useEffect(() => {
    function handleUnload() {
      finaliseSession();
    }
    function handleVisibility() {
      if (document.hidden && sessionRef.current) {
        // Save a snapshot (don't finalise — user might come back)
        const s = sessionRef.current;
        s.endTime = new Date().toISOString();
        s.summary = buildSessionSummary(s);
        // 2026-05-06 Bug #5: includi disegni anche nel snapshot di visibilitychange.
        s.drawings = snapshotDrawings(s.experimentId);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        const sessions = loadSessions();
        // Replace or append
        const idx = sessions.findIndex(x => x.id === s.id);
        if (idx >= 0) sessions[idx] = s;
        else sessions.push(s);
        saveSessions(sessions);
        // Reset endTime so session continues if user returns
        s.endTime = null;
      }
    }

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [finaliseSession]);

  // Stable reference — prevents re-render cascades in consumers
  return useMemo(() => ({
    startSession,
    recordMessage,
    recordAction,
    recordError,
    finaliseSession,
  }), [startSession, recordMessage, recordAction, recordError, finaliseSession]);
}

// ─── Static helpers (no hook needed) ─────────────────────────────────

/** Get all saved sessions from localStorage */
export function getSavedSessions() {
  return loadSessions();
}

/** Get the most recent session */
export function getLastSession() {
  const sessions = loadSessions();
  return sessions.length > 0 ? sessions[sessions.length - 1] : null;
}

/** Get sessions for a specific experiment */
export function getSessionsForExperiment(experimentId) {
  return loadSessions().filter(s => s.experimentId === experimentId);
}

// 2026-05-06 Bug #5: ripristina i disegni della lavagna dal record di sessione.
// Usato da Cronologia "Riprendi" o quando arriva una sessione da Supabase su un
// device dove il localStorage `elab_wb_*` è vuoto. Restituisce true se ha scritto
// almeno una chiave; false se la session non ha disegni o se localStorage assente.
// Security: sanitize experimentId per prevenire writes su key arbitrarie quando
// la session arriva da Supabase con expId controllato esternamente.
const VALID_EXPID_RE = /^[a-zA-Z0-9_-]+$/;
export function restoreDrawingsFromSession(session) {
  if (!session?.drawings || typeof localStorage === 'undefined') return false;
  const expId = session.experimentId;
  if (!expId || !VALID_EXPID_RE.test(expId)) return false;
  let restored = false;
  try {
    const wbKey = expId !== 'lobby' ? `elab_wb_${expId}` : 'elab_wb_sandbox';
    const svgKey = expId !== 'lobby' ? `elab-drawing-${expId}` : 'elab-drawing-paths';
    if (session.drawings.whiteboard) {
      localStorage.setItem(wbKey, session.drawings.whiteboard);
      restored = true;
    }
    if (session.drawings.svgPaths) {
      localStorage.setItem(svgKey, session.drawings.svgPaths);
      restored = true;
    }
  } catch { /* quota / unavailable */ }
  return restored;
}

export default useSessionTracker;
