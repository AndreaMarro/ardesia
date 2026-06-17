// © Andrea Marro — 26/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * src/services/blocklyHighlightBridge.js
 *
 * Bridge service that translates UNLIM chat AZIONE:highlight tags into
 * live Blockly workspace selection. Consumed by BuildModeGuide (Wave 2 X.3b
 * Impl-F, Option C — wire UNLIM chat into existing passo-passo panel) and
 * by Vol3 lesson-paths `unlim_template.highlight_block_ids` per step.
 *
 * The bridge intentionally only depends on:
 *   - window.__ELAB_BLOCKLY_WORKSPACE (set by ScratchEditor on mount), OR
 *   - an explicit workspace passed in (test seam).
 *
 * It does NOT import Blockly directly — keeping this file engine-agnostic
 * preserves the lazy-load boundary in ScratchEditor.jsx.
 *
 * Andrea Marro — Wave 2b iter X.3b — feedback_passo_passo_regression_06may2026
 * carryover close (9+ iter).
 */

/**
 * Internal: resolve the active Blockly workspace.
 * Mirrors src/features/unlimScreenAgent/actions/utils.ts getBlocklyWorkspace
 * but inlined here so this service has zero TS cross-deps in tests.
 */
function getActiveWorkspace() {
  if (typeof window === 'undefined') return null;
  if (window.__ELAB_BLOCKLY_WORKSPACE) return window.__ELAB_BLOCKLY_WORKSPACE;
  try {
    return window.Blockly?.getMainWorkspace?.() || null;
  } catch {
    return null;
  }
}

/**
 * Parse AZIONE:highlight:<id>[,<id2>,...] tags out of arbitrary UNLIM text.
 * Tag syntax is case-insensitive on the AZIONE keyword (matches the
 * lavagna intentsDispatcher convention). Returns a flat, trimmed list.
 *
 * @param {string} text raw UNLIM response text
 * @returns {string[]} block IDs in the order they appear, whitespace trimmed
 */
export function parseHighlightActionTags(text) {
  if (typeof text !== 'string' || !text) return [];
  const ids = [];
  const re = /\[azione:highlight:([^\]]+)\]/gi;
  let match;
  while ((match = re.exec(text)) !== null) {
    const payload = match[1] || '';
    payload
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((id) => ids.push(id));
  }
  return ids;
}

/**
 * Resolve a list of block IDs against the workspace. IDs that don't exist
 * are dropped Vol3 lesson-paths may reference IDs that haven't been
 * authored yet, and the bridge must degrade safely. Order preserved + deduped.
 *
 * @param {string[]} ids
 * @param {object|null} [workspace] explicit workspace; falls back to global
 * @returns {string[]} subset of ids actually present in the workspace
 */
export function resolveBlockIdsFromWorkspace(ids, workspace) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const ws = workspace || getActiveWorkspace();
  if (!ws || typeof ws.getBlockById !== 'function') return [];
  const seen = new Set();
  const resolved = [];
  for (const rawId of ids) {
    const id = typeof rawId === 'string' ? rawId.trim() : '';
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const block = ws.getBlockById(id);
    if (block) resolved.push(id);
  }
  return resolved;
}

/**
 * Apply highlight selection on every resolvable block, return a structured
 * report (highlighted plus skipped). Wraps select() calls in a try/catch so
 * a single malformed block never aborts the batch.
 *
 * @param {string[]} requestedIds
 * @param {object|null} [workspace]
 * @returns {{ highlighted: string[], skipped: string[] }}
 */
export function emitHighlightAction(requestedIds, workspace) {
  const ids = Array.isArray(requestedIds) ? requestedIds : [];
  const ws = workspace || getActiveWorkspace();
  if (!ws || typeof ws.getBlockById !== 'function') {
    return { highlighted: [], skipped: ids.slice() };
  }
  const highlighted = [];
  const skipped = [];
  const seen = new Set();
  for (const rawId of ids) {
    const id = typeof rawId === 'string' ? rawId.trim() : '';
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const block = ws.getBlockById(id);
    if (block && typeof block.select === 'function') {
      try {
        block.select();
        highlighted.push(id);
      } catch {
        skipped.push(id);
      }
    } else {
      skipped.push(id);
    }
  }
  return { highlighted, skipped };
}

/**
 * Apply a lesson-path unlim_template block:
 *
 *   {
 *     "highlight_block_ids": ["arduino_pin_mode_1"],
 *     "explanation": "Ragazzi, controlliamo il pin (Vol3 pag 47)."
 *   }
 *
 * Routes highlight_block_ids through emitHighlightAction, returns the
 * explanation untouched (BuildModeGuide will surface it to the docente).
 *
 * @param {object|null} template
 * @param {object|null} [workspace]
 * @returns {{ highlighted: string[], skipped: string[], explanation: string }}
 */
export function applyHighlightTemplate(template, workspace) {
  if (!template || typeof template !== 'object') {
    return { highlighted: [], skipped: [], explanation: '' };
  }
  const ids = Array.isArray(template.highlight_block_ids)
    ? template.highlight_block_ids
    : [];
  const explanation = typeof template.explanation === 'string' ? template.explanation : '';
  const result = emitHighlightAction(ids, workspace);
  return { ...result, explanation };
}

export default {
  parseHighlightActionTags,
  resolveBlockIdsFromWorkspace,
  emitHighlightAction,
  applyHighlightTemplate,
};
