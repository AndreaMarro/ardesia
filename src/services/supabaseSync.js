/**
 * Supabase Sync Service — Write-through sync per ELAB Tutor
 *
 * Strategia: ogni azione salva in localStorage (immediato) + Supabase (async).
 * Se Supabase fallisce, metti in coda retry (localStorage).
 * Coda processata a ogni app start e ogni 5 minuti.
 *
 * © Andrea Marro — 01/04/2026
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';
import logger from '../utils/logger';

const QUEUE_KEY = 'elab_sync_queue';
const MAX_RETRIES = 5;
const MAX_QUEUE_SIZE = 200;
const QUEUE_EXPIRY_DAYS = 7;
let syncInterval = null;

// ─── Queue Management ───

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* localStorage full */ }
}

function addToQueue(table, data, operation = 'insert') {
  const queue = getQueue();
  const cutoff = Date.now() - QUEUE_EXPIRY_DAYS * 86400000;
  const fresh = queue.filter(item => item.createdAt > cutoff);
  const bounded = fresh.length >= MAX_QUEUE_SIZE ? fresh.slice(-MAX_QUEUE_SIZE + 1) : fresh;
  bounded.push({ table, data, operation, retries: 0, createdAt: Date.now() });
  saveQueue(bounded);
}

// ─── Session Sync ───

/**
 * Salva una sessione strutturata in Supabase (upsert by session id).
 * @param {object} session — from useSessionTracker: {id, experimentId, startTime, endTime, messages, actions, errors, summary}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveSession(session) {
  if (!session) return { success: false, error: 'No session data' };

  const row = {
    student_id: _getCurrentUserId(),
    class_key: _getCurrentClassKey(),
    experiment_id: session.experimentId || null,
    session_type: session.experimentId === 'lobby' ? 'lobby' : 'experiment',
    started_at: session.startTime || new Date().toISOString(),
    ended_at: session.endTime || null,
    duration_seconds: session.endTime && session.startTime
      ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000)
      : 0,
    completed: !!session.endTime,
    messages_count: session.messages?.length || 0,
    errors_count: session.errors?.length || 0,
    actions_count: session.actions?.length || 0,
    summary: session.summary || '',
    activity: session.actions?.slice(0, 50) || [], // cap to avoid huge payloads
  };

  if (!isSupabaseConfigured()) {
    addToQueue('student_sessions', row);
    return { success: false, error: 'Supabase non configurato — salvato in coda offline' };
  }

  if (!row.student_id) {
    addToQueue('student_sessions', row);
    return { success: false, error: 'Sessione anonima — salvata in coda offline' };
  }

  try {
    const { error } = await supabase.from('student_sessions').insert(row);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    logger.warn('[Sync] saveSession failed, queued:', err.message);
    addToQueue('student_sessions', row);
    return { success: false, error: err.message };
  }
}

/**
 * Carica sessioni da Supabase per una classe (o per lo studente corrente).
 * @param {string} [classId] — ID classe (per docente). Se omesso, carica sessioni studente corrente.
 * @param {string} [experimentId] — filtro opzionale per esperimento
 * @returns {Promise<Array>}
 */
export async function loadSessions(classId, experimentId) {
  if (!isSupabaseConfigured()) {
    return _loadSessionsFromLocalStorage(experimentId);
  }

  try {
    let query = supabase.from('student_sessions').select('*');

    if (classId) {
      // Docente: carica sessioni degli studenti nella classe
      const { data: students } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId);
      const studentIds = (students || []).map(s => s.student_id);
      if (studentIds.length === 0) return [];
      query = query.in('student_id', studentIds);
    } else {
      // Studente: carica le proprie sessioni
      const userId = _getCurrentUserId();
      if (!userId) return [];
      query = query.eq('student_id', userId);
    }

    if (experimentId) {
      query = query.eq('experiment_id', experimentId);
    }

    const { data, error } = await query
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.warn('[Sync] loadSessions failed, using localStorage:', err.message);
    return _loadSessionsFromLocalStorage(experimentId);
  }
}

/**
 * Salva/aggiorna progressi studente per un esperimento (upsert).
 * @param {string} studentId
 * @param {string} experimentId
 * @param {object} data — {completed, attempts, bestScore, totalTimeSec, lastResult, concepts}
 * @returns {Promise<{success: boolean}>}
 */
export async function saveProgress(studentId, experimentId, data) {
  if (!studentId || !experimentId) return { success: false };

  const row = {
    student_id: studentId,
    experiment_id: experimentId,
    completed: data.completed ?? false,
    attempts: data.attempts ?? 1,
    best_score: data.bestScore ?? null,
    total_time_sec: data.totalTimeSec ?? 0,
    last_result: data.lastResult ?? 'pending',
    concepts: data.concepts ?? [],
  };

  if (!isSupabaseConfigured()) {
    addToQueue('student_progress', row, 'upsert');
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('student_progress')
      .upsert(row, { onConflict: 'student_id,experiment_id' });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    logger.warn('[Sync] saveProgress failed, queued:', err.message);
    addToQueue('student_progress', row, 'upsert');
    return { success: false };
  }
}

/**
 * Carica tutti i progressi di uno studente.
 * @param {string} studentId
 * @returns {Promise<Array<{experiment_id, completed, attempts, best_score, total_time_sec, last_result, concepts}>>}
 */
export async function loadProgress(studentId) {
  if (!isSupabaseConfigured() || !studentId) {
    return _loadProgressFromLocalStorage(studentId);
  }

  try {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    logger.warn('[Sync] loadProgress failed, using localStorage:', err.message);
    return _loadProgressFromLocalStorage(studentId);
  }
}

/**
 * Salva un report di confusione.
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
 * @param {object} report — {studentId, experimentId, conceptId, level, context}
 */
export async function saveConfusionReport(report) {
  const row = {
    student_id: report.studentId || _getCurrentUserId(),
    experiment_id: report.experimentId,
    concept_id: report.conceptId || null,
    level: report.level,
    context: report.context || null,
  };

  if (!isSupabaseConfigured()) {
    addToQueue('confusion_reports', row);
    return;
  }

  try {
    const { error } = await supabase.from('confusion_reports').insert(row);
    if (error) throw error;
  } catch (err) {
    logger.warn('[Sync] confusion report failed, queued:', err.message);
    addToQueue('confusion_reports', row);
  }
}

// ─── iter 13 R3: Experiment Layout persistence (rotation field round-trip) ───
//
// HONEST FINDING: Supabase schema does NOT have a `experiment_layouts` table or
// rotation field today. saveSession() above stores activity log only. Adding a
// new Supabase table requires a migration (deferred Sprint S iter 14):
//
//   CREATE TABLE experiment_layouts (
//     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     student_id  text NOT NULL,
//     class_key   text,
//     experiment_id text NOT NULL,
//     layout      jsonb NOT NULL,  -- { compId: { x, y, rotation, parentId? } }
//     updated_at  timestamptz DEFAULT now(),
//     UNIQUE (student_id, experiment_id)
//   );
//
// iter 13 mitigation: localStorage round-trip helper preserves rotation field
// across page reload. When migration ships iter 14, swap localStorage for
// supabase.from('experiment_layouts').upsert(row).

const LAYOUT_KEY_PREFIX = 'elab_layout_';

/**
 * Salva layout esperimento (incluso rotation field) in localStorage.
 * Iter 14 swap: supabase.from('experiment_layouts').upsert(...)
 *
 * @param {string} experimentId — id esperimento
 * @param {Object} layout — { compId: { x, y, rotation, parentId? } }
 * @returns {{success: boolean, error?: string}}
 */
export function saveLayout(experimentId, layout) {
  if (!experimentId || !layout || typeof layout !== 'object') {
    return { success: false, error: 'Invalid args' };
  }
  try {
    // PRESERVE rotation field explicitly — iter 13 R3 mandate
    const sanitized = {};
    for (const compId of Object.keys(layout)) {
      const pos = layout[compId] || {};
      sanitized[compId] = {
        x: Number.isFinite(pos.x) ? pos.x : 0,
        y: Number.isFinite(pos.y) ? pos.y : 0,
        rotation: Number.isFinite(pos.rotation) ? pos.rotation : 0,
        ...(pos.parentId ? { parentId: pos.parentId } : {}),
      };
    }
    localStorage.setItem(LAYOUT_KEY_PREFIX + experimentId, JSON.stringify(sanitized));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Carica layout esperimento. Backward-compat: posizioni legacy senza rotation
 * → default rotation 0.
 *
 * @param {string} experimentId
 * @returns {Object|null} layout { compId: { x, y, rotation, parentId? } } | null
 */
export function loadLayout(experimentId) {
  if (!experimentId) return null;
  try {
    const raw = localStorage.getItem(LAYOUT_KEY_PREFIX + experimentId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    // Backward-compat: ensure rotation field present (default 0)
    const out = {};
    for (const compId of Object.keys(parsed)) {
      const pos = parsed[compId] || {};
      out[compId] = {
        x: Number.isFinite(pos.x) ? pos.x : 0,
        y: Number.isFinite(pos.y) ? pos.y : 0,
        rotation: Number.isFinite(pos.rotation) ? pos.rotation : 0,
        ...(pos.parentId ? { parentId: pos.parentId } : {}),
      };
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Cancella layout esperimento (testing helper).
 */
export function clearLayout(experimentId) {
  if (!experimentId) return;
  try {
    localStorage.removeItem(LAYOUT_KEY_PREFIX + experimentId);
  } catch { /* localStorage unavailable */ }
}

// ─── Legacy Sync Functions (kept for compatibility) ───

/**
 * Sincronizza una sessione studente a Supabase (legacy format).
 * @param {object} sessionData — { student_id, experiment_id, session_type, started_at, ended_at, duration_seconds, completed, score, activity }
 */
export async function syncSession(sessionData) {
  if (!isSupabaseConfigured()) {
    addToQueue('student_sessions', sessionData);
    return;
  }
  try {
    const { error } = await supabase.from('student_sessions').insert(sessionData);
    if (error) throw error;
  } catch (err) {
    logger.warn('[Sync] Session sync failed, queued for retry:', err.message);
    addToQueue('student_sessions', sessionData);
  }
}

/**
 * Sincronizza un mood report a Supabase.
 */
export async function syncMood(moodData) {
  if (!isSupabaseConfigured()) {
    addToQueue('mood_reports', moodData);
    return;
  }
  try {
    const { error } = await supabase.from('mood_reports').insert(moodData);
    if (error) throw error;
  } catch (err) {
    logger.warn('[Sync] Mood sync failed, queued:', err.message);
    addToQueue('mood_reports', moodData);
  }
}

/**
 * Sincronizza un risultato gioco a Supabase.
 */
export async function syncGameResult(gameData) {
  if (!isSupabaseConfigured()) {
    addToQueue('student_sessions', { ...gameData, session_type: 'game' });
    return;
  }
  try {
    const { error } = await supabase.from('student_sessions').insert({
      ...gameData,
      session_type: 'game',
      started_at: new Date().toISOString(),
      completed: true,
    });
    if (error) throw error;
  } catch (err) {
    logger.warn('[Sync] Game sync failed, queued:', err.message);
    addToQueue('student_sessions', { ...gameData, session_type: 'game' });
  }
}

// ─── Queue Processing ───

/**
 * Processa la coda di retry. Chiamata all'avvio app e periodicamente.
 */
export async function processSyncQueue() {
  if (!isSupabaseConfigured()) return;

  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) continue;

    try {
      if (item.operation === 'upsert') {
        const { error } = await supabase
          .from(item.table)
          .upsert(item.data, { onConflict: _getConflictKey(item.table) });
        if (error) throw error;
      } else {
        const { error } = await supabase.from(item.table).insert(item.data);
        if (error) throw error;
      }
    } catch {
      remaining.push({ ...item, retries: item.retries + 1 });
    }
  }

  saveQueue(remaining);
  if (remaining.length > 0) {
    logger.warn(`[Sync] ${remaining.length} items still in queue after processing`);
  }
}

/**
 * Avvia il sync periodico (ogni 5 minuti).
 */
export function startSyncInterval() {
  if (syncInterval) return;
  processSyncQueue();
  syncInterval = setInterval(processSyncQueue, 5 * 60 * 1000);
  window.addEventListener('online', processSyncQueue);
}

/**
 * Ferma il sync periodico.
 */
export function stopSyncInterval() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  window.removeEventListener('online', processSyncQueue);
}

// ─── Nudge (cross-device) ───

/**
 * Invia un nudge da insegnante a studente via Supabase.
 */
export async function sendNudge(nudgeData) {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase non configurato' };
  try {
    const { error } = await supabase.from('nudges').insert(nudgeData);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    logger.warn('[Sync] Nudge send failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Listener real-time per nudge destinati allo studente.
 */
export function subscribeToNudges(studentId, onNudge) {
  if (!isSupabaseConfigured() || !studentId) return { unsubscribe: () => {} };
  const isLocalHost = (() => {
    try {
      return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    } catch {
      return false;
    }
  })();
  if (isLocalHost && import.meta.env.VITE_ENABLE_SUPABASE_REALTIME !== 'true') {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel('nudges-' + studentId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'nudges',
      filter: `student_id=eq.${studentId}`,
    }, (payload) => {
      onNudge(payload.new);
    })
    .subscribe();

  return {
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

/**
 * Marca un nudge come letto.
 */
export async function markNudgeRead(nudgeId) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('nudges').update({ read: true, read_at: new Date().toISOString() }).eq('id', nudgeId);
}

// ─── Helpers ───

// Cache Supabase user ID on auth state change (avoids async in sync function)
let _cachedSupabaseUserId = null;
if (isSupabaseConfigured() && supabase?.auth) {
  supabase.auth.getSession().then(({ data }) => {
    _cachedSupabaseUserId = data?.session?.user?.id || null;
  }).catch(() => {});
  supabase.auth.onAuthStateChange((_event, session) => {
    _cachedSupabaseUserId = session?.user?.id || null;
  });
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
}

function _getCurrentUserId() {
  try {
    if (_cachedSupabaseUserId) return _cachedSupabaseUserId;

    // Legacy auth token
    const token = localStorage.getItem('elab_auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.userId || payload.sub || null;
      } catch { /* invalid token */ }
    }
    // Fallback: anonymous session ID
    return localStorage.getItem('elab_tutor_session') || null;
  } catch {
    return null;
  }
}

/**
 * Ottieni la chiave classe corrente (inserita dal docente al login).
 * Usata come filtro logico nelle query Supabase.
 * @returns {string|null}
 */
export function _getCurrentClassKey() {
  try {
    return localStorage.getItem('elab_class_key') || localStorage.getItem('elab-class-key') || null;
  } catch {
    return null;
  }
}

/**
 * Imposta la chiave classe (chiamata al login del docente).
 * @param {string} key
 */
export function setClassKey(key) {
  try {
    localStorage.setItem('elab_class_key', key);
  } catch { /* silent */ }
}

function _getConflictKey(table) {
  const conflicts = {
    student_progress: 'student_id,experiment_id',
  };
  return conflicts[table] || 'id';
}

function _loadSessionsFromLocalStorage(experimentId) {
  try {
    const sessions = JSON.parse(localStorage.getItem('elab_unlim_sessions') || '[]');
    if (experimentId) return sessions.filter(s => s.experimentId === experimentId);
    return sessions;
  } catch { return []; }
}

function _loadProgressFromLocalStorage(studentId) {
  try {
    const memoryRaw = localStorage.getItem('elab_unlim_memory');
    if (!memoryRaw) return [];
    const memory = JSON.parse(memoryRaw);
    if (!memory.experiments) return [];
    return Object.entries(memory.experiments).map(([expId, data]) => ({
      experiment_id: expId,
      completed: data.completed || false,
      attempts: data.attempts || 0,
      best_score: null,
      total_time_sec: 0,
      last_result: data.lastResult || 'pending',
      concepts: [],
    }));
  } catch { return []; }
}
