/**
 * ELAB — Drawing persistence helpers for DrawingOverlay (SVG annotations on canvas).
 *
 * Each experiment gets its own storage slot so drawings do NOT bleed across experiments.
 * When no experimentId is supplied (e.g., sandbox / pre-selection), drawings are saved
 * under 'paths' to preserve backward compatibility with the original global key.
 *
 * Sprint V iter 1 Atom A2.3 — session_id extension:
 *   - Pattern: `elab-drawing-<sessionId>-<expId>` quando sessionId presente.
 *   - Fallback chain in load: session-key → legacy-key → empty array.
 *   - Save: scrive SOLO la chiave canonica (session se presente, altrimenti legacy).
 *   - NON cancella chiavi legacy esistenti (preserve mandate iter 21+ Andrea).
 *
 * Prefix: `elab-drawing-`
 *   - `elab-drawing-paths`                       → legacy/default bucket when no expId
 *   - `elab-drawing-<experimentId>`              → legacy per-experiment bucket
 *   - `elab-drawing-<sessionId>-<experimentId>`  → session-scoped per-experiment bucket
 *
 * Note: the WhiteboardOverlay (canvas raster + vector shapes) uses a different
 * scheme (`elab_wb_<id>`). This module is only for the lighter SVG DrawingOverlay.
 */

export const DRAWING_STORAGE_PREFIX = 'elab-drawing-';
const DEFAULT_SUFFIX = 'paths';

function _expSuffix(experimentId) {
  return (typeof experimentId === 'string' && experimentId.length > 0)
    ? experimentId
    : DEFAULT_SUFFIX;
}

export function getDrawingStorageKey(experimentId, sessionId = null) {
  const expSuffix = _expSuffix(experimentId);
  if (typeof sessionId === 'string' && sessionId.length > 0) {
    return `${DRAWING_STORAGE_PREFIX}${sessionId}-${expSuffix}`;
  }
  return DRAWING_STORAGE_PREFIX + expSuffix;
}

/**
 * Load drawing paths.
 * Fallback chain when sessionId provided: session-scoped key → legacy key → [].
 * Never deletes legacy keys (mandate Andrea iter 21+).
 */
export function loadDrawingPaths(experimentId, sessionId = null) {
  try {
    if (typeof sessionId === 'string' && sessionId.length > 0) {
      const sessionRaw = localStorage.getItem(getDrawingStorageKey(experimentId, sessionId));
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    const legacyRaw = localStorage.getItem(getDrawingStorageKey(experimentId, null));
    if (!legacyRaw) return [];
    const parsed = JSON.parse(legacyRaw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDrawingPaths(paths, experimentId, sessionId = null) {
  try {
    localStorage.setItem(
      getDrawingStorageKey(experimentId, sessionId),
      JSON.stringify(Array.isArray(paths) ? paths : [])
    );
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearDrawingPaths(experimentId, sessionId = null) {
  try {
    localStorage.removeItem(getDrawingStorageKey(experimentId, sessionId));
  } catch {
    /* ignore */
  }
}
