# Sprint Contract Day 13 — sett-2 Day 06

**Cumulative Day**: 13
**Sprint-local Day**: sett-2 Day 06
**Sprint**: sett-2-stabilize-v2
**Branch**: `feature/sett-2-stabilize-v2`
**Format**: Harness 2.0
**Parent**: `sett-2-sprint-contract.md`
**Previous**: day-12 (score 7.2/10, 3 commits, CoV 5x 12166 PASS, WATERMARK_RESTAMP flagged)

## Context Recovery

Day 12 closed:
- 12166 tests PASS, CoV 5x consistent (Day 13 reconfirmed CoV 3x stable 18:08-18:12)
- Dashboard `#dashboard-v2` E2E spec 14 landed (smoke)
- MCP floor recovered 10 direct calls
- Benchmark 3.95/10 fast-mode
- Watermark filter integrated in CI doc (but post-build re-stamp problem observed: 73 files auto-stamped)
- Blocker open carry-over: **NPM_DEPS_APPROVAL_PENDING** (ai + zod for Vercel AI SDK)
- Blocker flagged: **WATERMARK_RESTAMP_POST_BUILD** P2 — build toolchain bypasses pre-commit filter

## Day 13 Focus — ROOT-CAUSE WATERMARK + BENCHMARK FULL + ADR

Andrea still silent on NPM approval → **continue debt pivot**. Priority: root-cause `scripts/add-signatures.js` so watermark no longer re-stamps every build (BLOCKER-004 close). Run benchmark full-mode (deferred Day 12). Write DashboardShell data ADR (data shape decision pending).

## Tasks (3 atomic)

### P0-1 Watermark re-stamp root cause fix (idempotent add-signatures.js)
- **Files**: `scripts/add-signatures.js` (edit)
- **Scope**: change `addSignatures()` to skip files that already contain the `© Andrea Marro` marker. Preserves existing sigs with original date → zero date-bump on repeated builds. New files still get stamped.
- **Rationale**: Day 12 observation — `prebuild: node scripts/add-signatures.js` stripped + re-added signatures every build, date bumping 73 files. Root cause: non-idempotent logic. Fix: early return if MARKER present. Keeps IP protection intent (new files signed) while eliminating CI noise.
- **Trade-off**: files added before fix keep their stamped date forever (no re-dating). Acceptable — watermark intent is IP proof-of-creation, not daily timestamp.
- **Acceptance**:
  1. `node scripts/add-signatures.js` run twice → second run reports "All N files already signed", zero diffs
  2. `npm run build` completes clean — no new dirty files post-build
  3. Existing tests remain green (12166)
  4. BLOCKER-004 closes in `automa/team-state/blockers.md`
- **Owner**: inline DEV
- **Est**: 20min ✅ COMPLETED 18:14

### P0-2 Benchmark full-mode run (Day 12 carry-over)
- **Files**: `automa/state/benchmark.json` (write)
- **Scope**: `node scripts/benchmark.cjs --write` (full mode) → produces real 10-metric score. Compare vs Day 12 fast-mode 3.95 baseline.
- **Rationale**: fast-mode since sett-2 Day 03 = cached artifact. Full-mode reality check overdue. Need honest score before sett-2 gate Day 14.
- **Acceptance**:
  1. benchmark.json commit_sha updated
  2. score_delta logged vs previous
  3. If score drops >0.3 → audit why (regression potential)
- **Owner**: inline DEV
- **Est**: 15min (likely bench+vitest+build ~5-10min)

### P0-3 DashboardShell data ADR
- **Files**: `docs/architectures/ADR-004-dashboardshell-data-source.md` (new)
- **Scope**: ADR documenting data source decision for Dashboard v2. Options: (a) Supabase direct query via supabase-js client, (b) Edge Function proxy `/dashboard-data`, (c) mock hardcoded (Day 13 placeholder). Rationale + implications + migration path.
- **Rationale**: DashboardShell placeholder landed Day 11 but data shape uncommitted. ADR closes decision loop before Day 14 implementation work. Harness 2.0 requires brain/hands decoupling documented.
- **Acceptance**:
  1. ADR file exists, < 200 lines
  2. Status: Accepted or Proposed (Andrea read later)
  3. Covers auth model (RLS vs JWT), error handling, cache strategy, offline behavior
  4. Links to T1-005 Dashboard task in sett-2 contract
- **Owner**: inline ARCH
- **Est**: 30min

## Success Metrics — 4 Grading (Harness 2.0)

| Dimension | Target | Day 13 notes |
|-----------|--------|--------------|
| Design Quality | ≥7.0 | watermark fix simplest-possible (idempotent early return), ADR scoped |
| Originality | ≥5.0 | debt work, not novel; ADR adds clarity = +1 |
| Craft | ≥8.0 | CoV 3x pre-work verified, benchmark full real |
| Functionality | ≥7.5 | watermark blocker closes, bench persisted, ADR ships |

## Gates — Hard

- GATE-1 pre-commit: test count ≥ 12166
- GATE-2 pre-push: CoV 3x consistent (already verified pre-work)
- GATE-3 pre-merge: CI green (verify before push)
- GATE-4 pre-deploy: bundle delta ≤10% (benchmark full provides)
- GATE-5 post-deploy: skip Day 13 (no deploy, debt-only)

## Rollback Plan

If P0-1 breaks build → `git revert` single commit, re-run, document in BLOCKER-004 why early-return insufficient (e.g., marker check false-positive on legitimate code mentioning Andrea Marro).

If benchmark score drops >0.5 → flag regression, investigate delta, consider revert last 3 commits.

## Stop Conditions Day 13

Natural stop after 3 tasks + audit + handoff + push. Continue to Day 14 per loop rules.

## MCP Call Floor Target

≥10 direct MCP calls Day 13 (Day 12 recovered to 10, maintain).
