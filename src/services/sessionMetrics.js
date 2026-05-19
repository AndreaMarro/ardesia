// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Session Metrics — Sprint 1 Context Mastery
 * Tracks session-level metrics for UNLIM's contextual awareness.
 * UNLIM can see "how long the teacher has been working" and detect frustration patterns.
 *
 * Usage:
 *   import { sessionMetrics } from './sessionMetrics';
 *   sessionMetrics.trackCompilation(true);  // success
 *   sessionMetrics.trackCompilation(false); // failure
 *   // In buildTutorContext():
 *   parts.push(sessionMetrics.formatForContext());
 */

const _metrics = {
  sessionStart: Date.now(),
  experimentStart: null,
  lastInteraction: Date.now(),
  compilationAttempts: 0,
  compilationFailures: 0,
  experimentId: null,
};

/**
 * Called when a new experiment is loaded.
 * Resets per-experiment counters.
 */
export function trackExperimentLoad(experimentId) {
  _metrics.experimentStart = Date.now();
  _metrics.compilationAttempts = 0;
  _metrics.compilationFailures = 0;
  _metrics.experimentId = experimentId;
  _metrics.lastInteraction = Date.now();
}

/**
 * Called after each compilation attempt.
 * @param {boolean} success - Whether compilation succeeded
 */
export function trackCompilation(success) {
  _metrics.compilationAttempts++;
  if (!success) _metrics.compilationFailures++;
  _metrics.lastInteraction = Date.now();
}

/**
 * Called on any user interaction to update idle timer.
 */
export function trackInteraction() {
  _metrics.lastInteraction = Date.now();
}

/**
 * Format session metrics as compact context for UNLIM.
 * @returns {string} Empty string if no experiment loaded.
 */
export function formatForContext() {
  if (!_metrics.experimentStart) return '';

  const now = Date.now();
  const sessionMin = Math.floor((now - _metrics.sessionStart) / 60000);
  const expMin = Math.floor((now - _metrics.experimentStart) / 60000);
  const idleSec = Math.floor((now - _metrics.lastInteraction) / 1000);

  const parts = [`sessione=${sessionMin}min`, `esperimento=${expMin}min`];

  if (_metrics.compilationAttempts > 0) {
    parts.push(`compilazioni=${_metrics.compilationAttempts}`);
    if (_metrics.compilationFailures > 0) {
      parts.push(`fallite=${_metrics.compilationFailures}`);
    }
  }

  if (idleSec > 30) {
    parts.push(`inattivo=${idleSec}s`);
  }

  return `[METRICHE] ${parts.join(', ')}`;
}

/**
 * Reset all metrics (for testing or session reset).
 */
export function resetMetrics() {
  _metrics.sessionStart = Date.now();
  _metrics.experimentStart = null;
  _metrics.lastInteraction = Date.now();
  _metrics.compilationAttempts = 0;
  _metrics.compilationFailures = 0;
  _metrics.experimentId = null;
}

export const sessionMetrics = {
  trackExperimentLoad,
  trackCompilation,
  trackInteraction,
  formatForContext,
  resetMetrics,
};

// Expose globally for cross-component access
if (typeof window !== 'undefined') {
  window.__ELAB_METRICS = sessionMetrics;
}
