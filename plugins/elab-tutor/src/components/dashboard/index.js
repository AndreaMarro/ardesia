// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Dashboard barrel — Day 10 P0-3 scaffold
 *
 * Re-export del DashboardShell come named `Dashboard` e come default,
 * per preservare la firma dell'export legacy (`default function Dashboard`)
 * del precedente `index.jsx` scaffold (commit 7acf0a0) ed evitare
 * regressioni di import per chiamanti futuri.
 *
 * Shell only — NO feature logic. Feature Day 11+ (vedi day-10-contract.md).
 *
 * Claude Code (team-dev Opus) — 21/04/2026 — Andrea Marro
 */
export { default as Dashboard } from './DashboardShell';
export { default } from './DashboardShell';
