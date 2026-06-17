/**
 * classProfile — Costruisce il profilo classe dalle sessioni salvate
 * Usato da UnlimWrapper per messaggi di benvenuto contestuali
 * e da buildTutorContext per iniettare il contesto nel system prompt.
 * © Andrea Marro — 28/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { getSavedSessions } from '../hooks/useSessionTracker';
import { getLessonPath } from '../data/lesson-paths';

// ─── Memoization cache (avoids triple localStorage parse in welcome flow) ────
let _profileCache = null;
let _profileCacheTime = 0;
const CACHE_TTL_MS = 2000; // 2 seconds — stale enough to avoid triple parse, fresh enough for updates

/**
 * Build a class profile from all saved sessions.
 * @returns {{
 *   lastExperimentId: string|null,
 *   lastExperimentTitle: string|null,
 *   lastSessionDate: string|null,
 *   experimentsCompleted: string[],
 *   conceptsLearned: string[],
 *   commonErrors: {type: string, count: number}[],
 *   nextSuggested: string|null,
 *   nextSuggestedTitle: string|null,
 *   resumeMessage: string|null,
 *   totalSessions: number,
 *   totalMessages: number,
 *   isFirstTime: boolean,
 * }}
 */
export function buildClassProfile() {
  const now = Date.now();
  if (_profileCache && (now - _profileCacheTime) < CACHE_TTL_MS) {
    return _profileCache;
  }

  const sessions = getSavedSessions();

  if (sessions.length === 0) {
    const empty = {
      lastExperimentId: null,
      lastExperimentTitle: null,
      lastSessionDate: null,
      experimentsCompleted: [],
      conceptsLearned: [],
      commonErrors: [],
      nextSuggested: null,
      nextSuggestedTitle: null,
      resumeMessage: null,
      totalSessions: 0,
      totalMessages: 0,
      isFirstTime: true,
    };
    _profileCache = empty;
    _profileCacheTime = now;
    return empty;
  }

  // Last session
  const lastSession = sessions[sessions.length - 1];
  const lastPath = getLessonPath(lastSession.experimentId);

  // All unique experiments completed
  const experimentsCompleted = [...new Set(sessions.map(s => s.experimentId))];

  // All concepts learned (from lesson path session_save.concepts_covered)
  const conceptsSet = new Set();
  for (const s of sessions) {
    const path = getLessonPath(s.experimentId);
    const concepts = path?.session_save?.concepts_covered || [];
    concepts.forEach(c => conceptsSet.add(c));
  }

  // Error frequency across all sessions
  const errorCounts = {};
  for (const s of sessions) {
    for (const err of s.errors || []) {
      errorCounts[err.type] = (errorCounts[err.type] || 0) + 1;
    }
  }
  const commonErrors = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));

  // Next suggested experiment (from last session's lesson path)
  const nextSuggested = lastPath?.session_save?.next_suggested || null;
  const nextPath = nextSuggested ? getLessonPath(nextSuggested) : null;

  // Resume message from lesson path
  const resumeMessage = lastPath?.session_save?.resume_message || null;

  // Total messages across all sessions
  const totalMessages = sessions.reduce((sum, s) => sum + (s.messages?.length || 0), 0);

  const profile = {
    lastExperimentId: lastSession.experimentId,
    lastExperimentTitle: lastPath?.title || lastSession.experimentId,
    lastSessionDate: lastSession.endTime || lastSession.startTime,
    experimentsCompleted,
    conceptsLearned: [...conceptsSet],
    commonErrors,
    nextSuggested,
    nextSuggestedTitle: nextPath?.title || nextSuggested,
    resumeMessage,
    totalSessions: sessions.length,
    totalMessages,
    isFirstTime: false,
  };

  _profileCache = profile;
  _profileCacheTime = now;
  return profile;
}

/**
 * Build a compact context string for the AI system prompt.
 * Injected alongside unlimMemory.buildMemoryContext().
 * @returns {string} Context block or empty string
 */
export function buildClassContext() {
  const profile = buildClassProfile();
  if (profile.isFirstTime) return '';

  const parts = ['[CONTESTO CLASSE]'];

  parts.push(`Sessioni totali: ${profile.totalSessions}`);
  parts.push(`Ultimo esperimento: ${profile.lastExperimentTitle} (${profile.lastExperimentId})`);

  if (profile.experimentsCompleted.length > 0) {
    parts.push(`Esperimenti fatti: ${profile.experimentsCompleted.join(', ')}`);
  }

  if (profile.conceptsLearned.length > 0) {
    parts.push(`Concetti appresi: ${profile.conceptsLearned.join(', ')}`);
  }

  if (profile.commonErrors.length > 0) {
    const errStr = profile.commonErrors.map(e => `${e.type}(x${e.count})`).join(', ');
    parts.push(`Errori frequenti classe: ${errStr}`);
  }

  if (profile.nextSuggested) {
    parts.push(`Prossimo suggerito: ${profile.nextSuggestedTitle} (${profile.nextSuggested})`);
  }

  return parts.join('\n');
}

/**
 * Generate the welcome message for UNLIM based on class history.
 * @returns {{ text: string, type: 'returning'|'first_time' }}
 */
export function getWelcomeMessage() {
  const profile = buildClassProfile();

  if (profile.isFirstTime) {
    return {
      text: 'Ciao! È la prima volta? Iniziamo dal primo esperimento: accendiamo un LED!',
      type: 'first_time',
    };
  }

  // Use the resume_message from the lesson path if available
  if (profile.resumeMessage) {
    return {
      text: profile.resumeMessage,
      type: 'returning',
    };
  }

  // Fallback: build a generic contextual message
  const title = profile.lastExperimentTitle || 'l\'ultimo esperimento';
  return {
    text: `Bentornati! L'ultima volta avete fatto "${title}". Pronti per continuare?`,
    type: 'returning',
  };
}

/**
 * Get the suggested next experiment to load.
 * @returns {{ experimentId: string, title: string, message: string }|null}
 */
export function getNextLessonSuggestion() {
  const profile = buildClassProfile();

  if (profile.isFirstTime) {
    const firstPath = getLessonPath('v1-cap6-esp1');
    return {
      experimentId: 'v1-cap6-esp1',
      title: firstPath?.title || 'Accendi il tuo primo LED',
      message: 'Iniziamo dal primo esperimento: accendiamo un LED! Premi per iniziare.',
    };
  }

  if (!profile.nextSuggested) return null;

  const nextPath = getLessonPath(profile.nextSuggested);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  if (!nextPath) return null;

  return {
    experimentId: profile.nextSuggested,
    title: nextPath.title,
    message: `La prossima lezione è "${nextPath.title}". Vuoi iniziare?`,
  };
}
