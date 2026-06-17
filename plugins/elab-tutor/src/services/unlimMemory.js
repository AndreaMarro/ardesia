/**
 * UNLIM ONNIPOTENTE — Persistent Memory Service
 * (c) Andrea Marro — 01/04/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Three-tier memory:
 *   1. localStorage (immediate, always available)
 *   2. Supabase lesson_contexts (cross-device, durable)
 *   3. Nanobot /memory (AI-enriched analysis, optional)
 *
 * Tracks student learning profile across sessions:
 * - Experiments completed and attempts
 * - Quiz results per experiment
 * - Common mistakes (category + detail)
 * - Session summaries (last 10)
 * - Lesson contexts per class (for UNLIM cross-session awareness)
 *
 * Exposed globally as window.__unlimMemory for use by buildTutorContext().
 */

import supabase, { isSupabaseConfigured } from './supabaseClient';
import logger from '../utils/logger';

const MEMORY_KEY = 'elab_unlim_memory';
const CONTEXTS_KEY = 'elab_lesson_contexts';
const MAX_HISTORY_SESSIONS = 10;
const MAX_MISTAKES = 50;
const MAX_CONTEXTS = 30;

// ─── Local Profile (tier 1: localStorage) ──────────────────────

/**
 * Get the full student profile from localStorage
 * @returns {Object} The student memory profile
 */
function getProfile() {
    try {
        return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    } catch {
        return {};
    }
}

/**
 * Update the student profile (merge with existing)
 * @param {Object} updates - Fields to merge
 */
function updateProfile(updates) {
    const current = getProfile();
    const merged = { ...current, ...updates, lastUpdated: Date.now() };
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(merged));
    } catch { /* localStorage full — silent */ }
    _syncDirty = true;
    // Keep beacon payload fresh for beforeunload
    _refreshBeaconPayload();
}

/**
 * Track experiment completion
 * @param {string} experimentId - e.g., 'v1-cap6-esp1'
 * @param {string} result - 'success' | 'partial' | 'skipped'
 */
function trackExperimentCompletion(experimentId, result = 'success') {
    const profile = getProfile();
    if (!profile.experiments) profile.experiments = {};
    const prev = profile.experiments[experimentId] || {};
    profile.experiments[experimentId] = {
        completed: true,
        attempts: (prev.attempts || 0) + 1,
        lastResult: result,
        timestamp: Date.now(),
    };
    updateProfile(profile);
}

/**
 * Track quiz result for an experiment
 */
function trackQuizResult(experimentId, correct, total) {
    const profile = getProfile();
    if (!profile.quizzes) profile.quizzes = {};
    profile.quizzes[experimentId] = {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
        timestamp: Date.now(),
    };
    updateProfile(profile);
}

/**
 * Track a mistake the student made
 */
function trackMistake(category, detail) {
    const profile = getProfile();
    if (!profile.mistakes) profile.mistakes = [];
    profile.mistakes.push({
        category,
        detail,
        timestamp: Date.now(),
    });
    if (profile.mistakes.length > MAX_MISTAKES) {
        profile.mistakes = profile.mistakes.slice(-MAX_MISTAKES);
    }
    updateProfile(profile);
}

/**
 * Save a summary of the current session
 */
function saveSessionSummary(summary) {
    const profile = getProfile();
    if (!profile.sessionSummaries) profile.sessionSummaries = [];
    profile.sessionSummaries.push({
        summary,
        timestamp: Date.now(),
    });
    if (profile.sessionSummaries.length > MAX_HISTORY_SESSIONS) {
        profile.sessionSummaries = profile.sessionSummaries.slice(-MAX_HISTORY_SESSIONS);
    }
    updateProfile(profile);
}

/**
 * Build a compressed context string for the AI
 * @returns {string} Memory context block or empty string
 */
function buildMemoryContext() {
    const p = getProfile();
    if (!p.experiments && !p.mistakes && !p.quizzes && !p.sessionSummaries) return '';

    const parts = [
        '[MEMORIA STUDENTE]',
        'MEMORIA PASSATA PERSISTENTE: non e stato live attuale; serve per livello, continuita ed errori ricorrenti.',
    ];

    if (p.experiments) {
        const completed = Object.keys(p.experiments).filter(k => p.experiments[k].completed);
        parts.push(`Esperimenti completati: ${completed.length}/69`);
        const recent = completed.slice(-3);
        if (recent.length > 0) parts.push(`Ultimi: ${recent.join(', ')}`);
    }

    if (p.quizzes) {
        const quizEntries = Object.entries(p.quizzes);
        if (quizEntries.length > 0) {
            const totalCorrect = quizEntries.reduce((s, [, q]) => s + (q.correct || 0), 0);
            const totalQuestions = quizEntries.reduce((s, [, q]) => s + (q.total || 0), 0);
            if (totalQuestions > 0) {
                parts.push(`Quiz: ${totalCorrect}/${totalQuestions} (${Math.round((totalCorrect / totalQuestions) * 100)}%)`);
            }
            const weak = quizEntries
                .filter(([, q]) => q.total > 0 && q.percentage < 50)
                .map(([id]) => id);
            if (weak.length > 0) parts.push(`Quiz deboli: ${weak.slice(0, 3).join(', ')}`);
        }
    }

    if (p.mistakes?.length > 0) {
        const categories = {};
        p.mistakes.forEach(m => {
            categories[m.category] = (categories[m.category] || 0) + 1;
        });
        const top3 = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        parts.push(`Errori frequenti: ${top3.map(([k, v]) => `${k}(x${v})`).join(', ')}`);
    }

    if (p.sessionSummaries?.length > 0) {
        const last = p.sessionSummaries[p.sessionSummaries.length - 1];
        parts.push(`Sessione precedente: ${last.summary}`);
    }

    if (p._backendLevel) parts.push(`Livello backend: ${p._backendLevel}`);
    if (p._backendWeaknesses?.length) parts.push(`Debolezze: ${p._backendWeaknesses.join(', ')}`);
    if (p._backendStrengths?.length) parts.push(`Punti forti: ${p._backendStrengths.join(', ')}`);

    return parts.join('\n');
}

/**
 * Reset all memory (for testing/debugging)
 */
function resetMemory() {
    localStorage.removeItem(MEMORY_KEY);
    localStorage.removeItem(CONTEXTS_KEY);
}

// ─── Lesson Context (tier 2: Supabase cross-session) ──────────

/**
 * Salva il contesto di una lezione per la classe.
 * Permette ad UNLIM di sapere cosa è stato fatto nelle lezioni precedenti.
 * @param {string} classId - ID classe (null per studente singolo)
 * @param {string} experimentId - e.g. 'v1-cap6-esp1'
 * @param {object} context - {summary, concepts_covered, mistakes, quiz_results}
 */
async function saveContext(classId, experimentId, context) {
    // Always save locally first
    _saveContextLocal(classId, experimentId, context);

    if (!isSupabaseConfigured()) return;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati

    try {
        const userId = _getCurrentUserId();
        if (!userId) return;

        await supabase.from('lesson_contexts').insert({
            class_id: classId || null,
            student_id: userId,
            experiment_id: experimentId,
            context_data: context,
            session_summary: context.summary || '',
        });
    } catch (err) {
        logger.warn('[UnlimMemory] saveContext to Supabase failed:', err.message);
    }
}

/**
 * Carica TUTTO il contesto precedente di una classe.
 * Usato da UNLIM per costruire la conoscenza delle lezioni passate.
 * @param {string} classId - ID classe
 * @returns {Promise<Array<{experimentId, context, summary, timestamp}>>}
 */
async function loadContext(classId) {
    if (!isSupabaseConfigured() || !classId) {
        return _loadContextLocal(classId);
    }

    try {
        const { data, error } = await supabase
            .from('lesson_contexts')
            .select('experiment_id, context_data, session_summary, created_at')
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
            .limit(MAX_CONTEXTS);

        if (error) throw error;

        return (data || []).map(row => ({
            experimentId: row.experiment_id,
            context: row.context_data,
            summary: row.session_summary,
            timestamp: row.created_at,
        }));
    } catch (err) {
        logger.warn('[UnlimMemory] loadContext from Supabase failed:', err.message);
        return _loadContextLocal(classId);
    }
}

/**
 * Ritorna l'ultima lezione fatta dalla classe.
 * @param {string} classId
 * @returns {Promise<{experimentId, summary, timestamp}|null>}
 */
async function getLastLesson(classId) {
    const contexts = await loadContext(classId);
    if (contexts.length === 0) {
        // Fallback: use local session summaries
        const profile = getProfile();
        const last = profile.sessionSummaries?.[profile.sessionSummaries.length - 1];
        if (!last) return null;
        return { experimentId: null, summary: last.summary, timestamp: last.timestamp };
    }
    return contexts[0]; // Already sorted DESC
}

/**
 * Ritorna esperimenti completati e concetti acquisiti per la classe.
 * @param {string} classId
 * @returns {Promise<{completedExperiments: string[], conceptsAcquired: string[]}>}
 */
async function getProgress(classId) {
    const contexts = await loadContext(classId);
    const experiments = new Set();
    const concepts = new Set();

    for (const ctx of contexts) {
        experiments.add(ctx.experimentId);
        if (ctx.context?.concepts_covered) {
            ctx.context.concepts_covered.forEach(c => concepts.add(c));
        }
    }

    // Also merge local profile data
    const profile = getProfile();
    if (profile.experiments) {
        Object.entries(profile.experiments)
            .filter(([, v]) => v.completed)
            .forEach(([k]) => experiments.add(k));
    }

    return {
        completedExperiments: [...experiments],
        conceptsAcquired: [...concepts],
    };
}

/**
 * Build enhanced context string including cross-session data.
 * This is the main function UNLIM uses to know what happened before.
 * @param {string} [classId]
 * @returns {Promise<string>}
 */
async function buildEnhancedContext(classId) {
    const parts = [];

    // Base memory (local)
    const base = buildMemoryContext();
    if (base) parts.push(base);

    // Cross-session context (Supabase or localStorage)
    const lastLesson = await getLastLesson(classId);
    if (lastLesson) {
        parts.push(`[ULTIMA LEZIONE] ${lastLesson.summary || lastLesson.experimentId || 'Sconosciuta'}`);
    }

    const progress = await getProgress(classId);
    if (progress.completedExperiments.length > 0) {
        parts.push(`[PERCORSO CLASSE] ${progress.completedExperiments.length} esperimenti completati: ${progress.completedExperiments.slice(-5).join(', ')}`);
    }
    if (progress.conceptsAcquired.length > 0) {
        parts.push(`[CONCETTI ACQUISITI] ${progress.conceptsAcquired.join(', ')}`);
    }

    return parts.join('\n');
}

/**
 * Build a strict live-vs-past context block for UNLIM.
 * Present data must always win over persisted memory.
 * @param {string} [classId]
 * @param {{experimentId?: string|null, liveState?: string|null, visibleScreen?: string|null}} [current]
 * @returns {Promise<string>}
 */
async function buildPersistentContext(classId, current = {}) {
    const parts = [
        '[PRESENTE LIVE]',
        'Questo e cio che succede ora e batte ogni memoria passata.',
    ];

    if (current.experimentId) parts.push(`Esperimento attivo ora: ${current.experimentId}`);
    if (current.liveState) parts.push(`Stato live ora: ${current.liveState}`);
    if (current.visibleScreen) parts.push(`Schermo/lavagna ora: ${current.visibleScreen}`);

    const memory = await buildEnhancedContext(classId);
    if (memory) {
        parts.push(
            '[MEMORIA PASSATA PERSISTENTE]',
            'Non trattare questa memoria come stato visibile ora.',
            memory,
        );
    }

    return parts.join('\n');
}

// ─── Local context storage ─────────────────────────────────

function _saveContextLocal(classId, experimentId, context) {
    try {
        const key = classId || '_self';
        const all = JSON.parse(localStorage.getItem(CONTEXTS_KEY) || '{}');
        if (!all[key]) all[key] = [];
        all[key].push({
            experimentId,
            context,
            summary: context.summary || '',
            timestamp: Date.now(),
        });
        // Cap per class
        if (all[key].length > MAX_CONTEXTS) {
            all[key] = all[key].slice(-MAX_CONTEXTS);
        }
        localStorage.setItem(CONTEXTS_KEY, JSON.stringify(all));
    } catch { /* localStorage full */ }
}

function _loadContextLocal(classId) {
    try {
        const key = classId || '_self';
        const all = JSON.parse(localStorage.getItem(CONTEXTS_KEY) || '{}');
        return (all[key] || []).reverse(); // Most recent first
    } catch {
        return [];
    }
}

// Cache Supabase user ID on auth state change (avoids async in sync function)
let _cachedSupabaseUserId = null;
if (isSupabaseConfigured() && supabase?.auth) {
    supabase.auth.getSession().then(({ data }) => {
        _cachedSupabaseUserId = data?.session?.user?.id || null;
    }).catch(() => {});
    supabase.auth.onAuthStateChange((_event, session) => {
        _cachedSupabaseUserId = session?.user?.id || null;
    });
}

function _getCurrentUserId() {
    try {
        if (_cachedSupabaseUserId) return _cachedSupabaseUserId;

        const token = localStorage.getItem('elab_auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                return payload.userId || payload.sub || null;
            } catch { /* invalid token */ }
        }
        return localStorage.getItem('elab_tutor_session') || null;
    } catch {
        return null;
    }
}

// ─── Backend Sync (tier 3: nanobot — AI-enriched) ──────────────

const NANOBOT_URL = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_NANOBOT_URL) || '').trim() || null;
let _syncDirty = false;
let _syncTimer = null;
let _autoSaveTimer = null;
let _beaconPayload = null; // Pre-serialized for beforeunload
const SYNC_INTERVAL = 60_000;
const AUTOSAVE_INTERVAL = 30_000;

function _getSessionId() {
    const KEY = 'elab_tutor_session';
    try {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        return localStorage.getItem(KEY) || '';
    } catch { return ''; }
}

async function syncWithBackend() {
    if (!NANOBOT_URL) return;
    const sessionId = _getSessionId();
    if (!sessionId) return;

    const profile = getProfile();
    if (!profile.lastUpdated) return;

    try {
        const res = await fetch(`${NANOBOT_URL}/memory/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, profile }),
            signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
            _syncDirty = false;
        }
    } catch {
        // Silent — backend may be down
    }
}

async function loadFromBackend() {
    if (!NANOBOT_URL) return;
    const sessionId = _getSessionId();
    if (!sessionId) return;

    try {
        const res = await fetch(`${NANOBOT_URL}/memory/${encodeURIComponent(sessionId)}`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.profile) return;

        const backend = data.profile;
        const local = getProfile();
        const merged = { ...local };

        if (backend.experiments_completed?.length) {
            if (!merged.experiments) merged.experiments = {};
            for (const expId of backend.experiments_completed) {
                if (!merged.experiments[expId]) {
                    merged.experiments[expId] = { completed: true, attempts: 1, timestamp: Date.now() };
                }
            }
        }

        if (backend.quiz_results?.total > 0) {
            if (!merged.quizzes) merged.quizzes = {};
            const localQuizTotal = Object.values(merged.quizzes || {}).reduce((s, q) => s + (q.total || 0), 0);
            if (backend.quiz_results.total > localQuizTotal) {
                merged._backendQuiz = backend.quiz_results;
            }
        }

        if (backend.level && backend.level !== 'principiante') {
            merged._backendLevel = backend.level;
        }
        if (backend.weaknesses?.length) merged._backendWeaknesses = backend.weaknesses;
        if (backend.strengths?.length) merged._backendStrengths = backend.strengths;

        updateProfile(merged);
    } catch {
        // Silent
    }
}

function stopSync() {
    if (_syncTimer) {
        clearInterval(_syncTimer);
        _syncTimer = null;
    }
    if (_autoSaveTimer) {
        clearInterval(_autoSaveTimer);
        _autoSaveTimer = null;
    }
}

/**
 * Pre-serialize beacon payload so beforeunload sends already-prepared data.
 * Called on every auto-save cycle and after each profile update.
 */
function _refreshBeaconPayload() {
    try {
        const sessionId = _getSessionId();
        if (sessionId && NANOBOT_URL) {
            const profile = getProfile();
            _beaconPayload = new Blob(
                [JSON.stringify({ sessionId, profile })],
                { type: 'application/json' }
            );
        }
    } catch { /* silent */ }
}

/**
 * Periodic auto-save: ensures localStorage profile is written regularly
 * so beforeunload is just a last-resort, not the only save point.
 */
function _autoSave() {
    // Force a profile touch to ensure lastUpdated is current
    const profile = getProfile();
    if (profile.lastUpdated) {
        try {
            localStorage.setItem(MEMORY_KEY, JSON.stringify(profile));
        } catch { /* localStorage full */ }
    }
    // Pre-serialize beacon payload while we can
    if (_syncDirty) _refreshBeaconPayload();
}

function initSync() {
    loadFromBackend();

    // Clear any existing timers to prevent leaks on re-init
    stopSync();

    // Backend sync every 60s (if dirty)
    _syncTimer = setInterval(() => {
        if (_syncDirty) syncWithBackend();
    }, SYNC_INTERVAL);

    // Auto-save profile to localStorage every 30s + pre-serialize beacon
    _autoSaveTimer = setInterval(_autoSave, AUTOSAVE_INTERVAL);

    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
            // Last-chance auto-save to localStorage
            _autoSave();
            // Send pre-serialized payload via beacon (no serialization during event)
            if (_syncDirty && _beaconPayload && NANOBOT_URL) {
                try {
                    navigator.sendBeacon(
                        `${NANOBOT_URL}/memory/sync`,
                        _beaconPayload
                    );
                } catch { /* last resort */ }
            }
        });
    }
}

// Public API
export const unlimMemory = {
    // Tier 1: Local profile
    getProfile,
    updateProfile,
    trackExperimentCompletion,
    trackQuizResult,
    trackMistake,
    saveSessionSummary,
    buildMemoryContext,
    resetMemory,
    // Tier 2: Supabase cross-session
    saveContext,
    loadContext,
    getLastLesson,
    getProgress,
    buildEnhancedContext,
    buildPersistentContext,
    // Tier 3: Nanobot backend
    syncWithBackend,
    loadFromBackend,
    initSync,
    stopSync,
};

// Expose globally for buildTutorContext() access
if (typeof window !== 'undefined') {
    window.__unlimMemory = unlimMemory;
}

export default unlimMemory;
