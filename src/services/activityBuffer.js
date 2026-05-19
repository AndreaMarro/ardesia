// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Activity Ring Buffer — Sprint 1 Context Mastery
 * Tracks the last N user actions for UNLIM's contextual awareness.
 * UNLIM can see "what the teacher just did" and offer proactive help.
 *
 * Usage:
 *   import { pushActivity, getRecentActivities, formatForContext } from './activityBuffer';
 *   pushActivity('compile_error', 'undefined reference to loop');
 *   // In buildTutorContext():
 *   parts.push(formatForContext(5));
 */

const MAX_SIZE = 20;
const _buffer = [];

/**
 * Push a new activity into the ring buffer.
 * @param {string} type - Activity type (e.g. 'component_added', 'compile_error', 'play', 'tab_switch')
 * @param {string} [detail] - Optional detail (e.g. component ID, error message)
 */
export function pushActivity(type, detail = '') {
  _buffer.push({
    type,
    detail: typeof detail === 'string' ? detail.slice(0, 120) : String(detail).slice(0, 120),
    ts: Date.now(),
  });
  if (_buffer.length > MAX_SIZE) _buffer.splice(0, _buffer.length - MAX_SIZE);
}

/**
 * Get the last N activities (most recent last).
 * @param {number} [n=5]
 * @returns {Array<{type: string, detail: string, ts: number}>}
 */
export function getRecentActivities(n = 5) {
  return _buffer.slice(-n);
}

/**
 * Format recent activities as a compact context string for UNLIM.
 * Example output:
 *   [ATTIVITÀ RECENTE]
 *   1. [14:03:15] compile_error: undefined reference to loop
 *   2. [14:03:22] component_added: led (led-1)
 * @param {number} [n=5]
 * @returns {string} Empty string if no activities.
 */
export function formatForContext(n = 5) {
  const recent = getRecentActivities(n);
  if (recent.length === 0) return '';

  const lines = recent.map((a, i) => {
    const t = new Date(a.ts);
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    const ss = String(t.getSeconds()).padStart(2, '0');
    return `${i + 1}. [${hh}:${mm}:${ss}] ${a.type}${a.detail ? ': ' + a.detail : ''}`;
  });

  return `[ATTIVITÀ RECENTE]\n${lines.join('\n')}`;
}

/**
 * Clear the buffer (for testing or session reset).
 */
export function clearActivities() {
  _buffer.length = 0;
}

// Expose globally for cross-component access without imports
if (typeof window !== 'undefined') {
  window.__ELAB_ACTIVITY = { pushActivity, getRecentActivities, formatForContext, clearActivities };
}
