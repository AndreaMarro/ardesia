# Sprint U — Ralph Iter 2 Handoff
**Date**: 2026-05-01
**From**: Ralph iter 1 close (Cycle 4 orchestrator)
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815 → PR to main → new branch for iter 2

---

## 1. ACTIVATION STRING (paste-ready)

```
Sprint U ralph-iter 2 — ACTIVATE

Branch: new branch off main post-PR merge (or continue current branch)
PDR: docs/plans/PDR-SPRINT-U-PARITA-NARRATIVA-94-ESPERIMENTI-RALPH-LOOP.md
Baseline: 13473 PASS (automa/state/heartbeat iter 1 complete)
Prior close: docs/audits/sprint-u-cycle1-iter1-close.md

P0 gaps to close:
1. "Ragazzi," opener 4/94 → 91 files missing (CRITICAL — docente read flow broken)
2. Palette hex violations 833 → 0 (visual regression risk — need baseline first)
3. Lighthouse perf 43 → ≥90 (react-pdf + mammoth eager-load diagnosis)
4. Vol/pag citation rate bench (live Edge Function R5 re-run post L2 fix)
5. Full 94-experiment Playwright sweep

PRINCIPIO ZERO: linguaggio plurale "Ragazzi," — teacher is tramite, not receiver.
Anti-regression: NEVER `--no-verify`, baseline 13473 MUST be preserved.
G45: NO claim without file-system or live verify.
```

---

## 2. State at iter 1 close

| Metric | State |
|--------|-------|
| vitest | 13473 PASS (1 pre-existing pixtral env skip) |
| Build | PASS |
| singolare violations | 0/94 |
| docente-framing | 0/94 ("Lo studente sta" removed) |
| JSON validity | 94/94 valid |
| L2 routing | Fixed (lesson-explain guard present) |
| "Ragazzi," opener | 4/94 (91 missing) |
| Palette hex | 833 violations (unaddressed) |
| Lighthouse perf | ~43 (unaddressed) |
| Scratch xml count | 26/26 |

---

## 3. Iter 2 strategy

### P0.1 — "Ragazzi," opener (91 files)

Each lesson-path JSON has a `steps[]` array. Each step has a `teacher_message`. The first `teacher_message` in each lesson-path should begin with "Ragazzi, ".

Pattern: find all lesson-path JSONs where first step teacher_message does NOT start with "Ragazzi, " → prepend "Ragazzi, " (lowercase 'r' if sentence continues naturally, capital if standalone).

Files: `src/data/lesson-paths/*.json` (94 total, 4 already have opener, 91 missing)

**Safe strategy**: bash loop + sed to insert "Ragazzi, " at start of first `teacher_message` value per file. Needs content-aware insert (not regex-blind). Recommend Python script for per-file first-occurrence logic.

### P0.2 — Palette hex violations

Source: `designcritique` audit found 833 violations. Worst: `src/components/dashboard/TeacherDashboard.jsx` (55).

**Risk**: batch replace CSS hex could break dark mode, hover states, or computed values. Approach:
1. Lighthouse visual regression baseline screenshot
2. sed replace top-N violators in a single component
3. Visual check
4. Expand to batch

### P0.3 — Lighthouse perf ≥90

Root cause: `react-pdf` (407KB) + `mammoth` (70KB) eager-loaded.
Fix: lazy import in `LavagnaShell.jsx` using React.lazy() + Suspense for VolumeViewer.
Already partially done per fix-orchestrator iter 1 notes. Check current Lighthouse score post-deploy.

### P0.4 — UNLIM Vol/pag bench

Run `scripts/bench/run-sprint-r5-stress.mjs` against live Edge Function post L2-fix deploy. Target ≥85% PZ compliance.

### P0.5 — 94-experiment Playwright sweep

Execute `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js` + `vol3-full.spec.js` (already written by livetest agents in iter 1).

---

## 4. Files to read for iter 2

- `docs/plans/PDR-SPRINT-U-PARITA-NARRATIVA-94-ESPERIMENTI-RALPH-LOOP.md` §5-§8 (cycle definitions, success criteria)
- `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` (full iter 1 findings)
- `docs/audits/sprint-u-cycle1-iter1-close.md` (this iter's honest close)
- `automa/state/heartbeat` (verify iter 1 CLOSED before starting iter 2)
- `src/data/lesson-paths/` (91 files needing "Ragazzi," opener)

---

## 5. Anti-patterns (NEVER do in iter 2)

- `--no-verify` on any commit
- Bulk find-replace palette hex without visual regression baseline
- Claim "Lighthouse ≥90" without running lighthouse locally or via Playwright
- Ship lesson-path JSON with invalid JSON (run `node -e "require('./path/file.json')"` per file)
- Reduce vitest below 13473 PASS
