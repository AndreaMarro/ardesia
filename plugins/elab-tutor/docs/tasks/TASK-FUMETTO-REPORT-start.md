# Pre-audit TASK-FUMETTO-REPORT

- **Data**: 2026-04-19T05:14Z
- **Branch**: feature/fumetto-report-mvp
- **SHA pre-task**: 7ce7714 (main HEAD post PR #4 vision-e2e merged)
- **Working tree**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-fumetto` (isolated worktree)
- **Trigger**: continuation per session prompt — PR #4 merged 47 min ago
- **CLI #1 state**: PID 31857 alive, 0.1% CPU idle (4h elapsed)
- **Baseline test (CI)**: 11958 (per .test-count-baseline.json)
- **Baseline test (local)**: 12088 (verified pre-rebase PR #5 push)
- **Build**: NOT RUN (will verify pre-PR)
- **Node**: v22.14.0

## Objective

Implement SessionReportComic — fine-sessione fumetto report con 6 vignette (3 completed esp + 3 placeholder) + narration UNLIM Principio Zero v3 + export PDF (browser print API fallback if html2pdf.js install blocked).

## Plan (PDR fumetto-report)

- Task 2.1 ✓ Pre-audit (this doc)
- Task 2.2 Brand assets dir structure (file copy via separate script, not part of PR — too large)
- Task 2.3 TDD test SessionReportComic (8 assertions)
- Task 2.5 Implementation SessionReportComic.jsx + .module.css
- Task 2.5b experiment-photo-map.js (mapping experimentId → photo path)
- Task 2.6 PDF export — use `window.print()` MVP (browser native, zero dep)
- Task 2.7 CoV 3x + audit + docs + PR draft

## Cuts (out of MVP scope)

- Task 2.4 design agency-agents consultation — palette + WCAG already known, CSS module sufficient for MVP
- html2pdf.js npm install — requires Andrea approval (CLAUDE.md regola 13). Use `window.print()` fallback. html2pdf.js can be added in Phase 2 PR.
- LavagnaShell integration deep — minimal hook only, full UX in Phase 2

## Regola 0 compliance

- Riusa: `src/data/experiments-vol*.js`, `src/services/api.js sendChat`, `src/services/studentService.js`, `src/components/lavagna/LavagnaShell.jsx`
- Nuovo: `SessionReportComic.jsx` + `.module.css`, `experiment-photo-map.js`, smoke test
- No rewrite. Pure addition.
