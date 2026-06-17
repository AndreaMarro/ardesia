// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * hashUtils — iter 30 P2.3 consolidation (Agent T iter 29 tech-debt P0-3).
 *
 * Extracts `?exp=<id>` from `window.location.hash` for deep-linking experiments.
 * Single source of truth replacing duplicate definitions in:
 * - src/App.jsx:83 (iter 27 P0 surgical fix consumer)
 * - src/components/lavagna/LavagnaShell.jsx:917 (iter 28 hashchange listener consumer)
 *
 * Both call sites now import from this module to prevent drift.
 *
 * Pure function: NO side effects, NO DOM mutation, safe SSR (returns null window undefined).
 *
 * (c) Andrea Marro — iter 30 P2.3 dedup
 */

/**
 * Extract `?exp=<id>` from `window.location.hash`.
 * Supports patterns: `#lavagna?exp=v1-cap6-esp1`, `#prova?exp=v3-cap5-esp1`, `#tutor?exp=v2-cap5-esp1`.
 * Returns null when hash absent OR no `?exp=` query.
 *
 * @returns {string|null} decoded experiment ID or null
 */
export function getExpFromHash() {
  if (typeof window === 'undefined' || !window.location) return null;
  const hash = window.location.hash || '';
  const match = hash.match(/[?&]exp=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
