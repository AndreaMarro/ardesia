/* © Andrea Marro — 23/05/2026 — ELAB Tutor — Tutti i diritti riservati */
/**
 * overlayPortal — pure helper for Lavagna overlay portal target.
 * Returns document.body when DOM is available, null otherwise (SSR / test env
 * without jsdom). Used by LavagnaShell.jsx to portal UNLIM chat, toolToast,
 * MascotPresence, wakeWordPill out of the .shell stacking context.
 *
 * Plan §6 Task 4. Pure helper for TDD (mount LavagnaShell completo è troppo
 * pesante per ogni assertion → test sull'helper).
 */
export function overlayPortalTarget() {
  if (typeof document === 'undefined') return null;
  return document.body || null;
}

/**
 * overlayPortalDisplayStyle — pure helper that returns the `display` CSS value
 * for the `.overlayRoot` wrapper, given the current activeTab.
 *
 * L4.1 fix (Codex stop-time review 2026-05-23): il portal di L4 originale
 * scappava al gate `display:none` su `.lavagnaView`, causando l'apparizione
 * della chat UNLIM su tab non-Lavagna (classe / progressi / lezione).
 *
 * Returns:
 *   - `undefined` (lascia il CSS modulo controllare → visible) quando
 *     activeTab === 'lavagna'
 *   - `'none'` (forza hidden) per ogni altro valore
 *
 * Il mount React resta preservato (no unmount → no perdita di chat history,
 * voice subs, FloatingWindow position) — viene solo nascosto visivamente.
 */
export function overlayPortalDisplayStyle(activeTab) {
  return activeTab === 'lavagna' ? undefined : 'none';
}
