# Sprint 2 Retrospective — sett-2-stabilize-v2

**Sprint**: 2/8 (cumulative Day 08-14)
**Date**: 2026-04-21
**Format**: Harness 2.0 compatible (Keep/Stop/Start + honest gap ledger)
**Attendees**: Andrea Marro (PO/dev), Claude Opus 4.7 (AI pair)

---

## TL;DR

Sprint-2 hygiene sprint closed PARTIAL. 5 blockers burned (target 3). Zero regression. Benchmark +0.22 (target +0.55). Self-score avg 7.25 (target 7.5). Process discipline hardened via Harness 2.0. NPM blocker open 4 days = sprint-3 scope risk.

---

## Keep (what worked — do more)

### K1. Harness 2.0 daily cadence
Sprint contract + standup + audit + handoff per day. State persistence survived context compacts. Daily 4-grading force-functioned honest self-assessment.

### K2. Root-cause discipline (Day 13 watermark)
Idempotent fix at source vs Day 11 band-aid filter. Closed class of false-positives. Pattern: **when blocker recurs, raise severity and fix mechanism, not just instance**.

### K3. CoV pre-work verification
CoV 3x every day before any code change. Caught zero regressions because no regressions introduced — discipline works. Confidence in "12166 PASS" is earned, not claimed.

### K4. Commit hygiene `[TEST N]` tag
Every sett-2 commit tagged with test count. Provides instant audit trail for regression detection (despite git_hygiene regex FP flagging this later — the tag itself is correct, the scorer is wrong).

### K5. Brutal-honest audits
20-dim metrics + ≥5 auto-critica gaps daily. Avoided inflation traps (Day 13 flagged MCP dip publicly vs hiding).

---

## Stop (what hurt — eliminate)

### S1. Compressed end-day work into single context window
Day 13 audit/handoff/state finalize + benchmark full-mode in one session = heavy cognitive load. Result: MCP calls dropped to 3 (below floor 10). Sprint-3: spread end-of-day across 2 checkpoints (post-work + post-push).

### S2. Assuming benchmark metrics always reflect reality
`git_hygiene = 0` despite correct `[TEST N]` tags. Did not audit benchmark.cjs regex until Day 13. Sprint-3: Day 01 mandatory audit of scoring script regexes.

### S3. Deferring Dashboard feature logic indefinitely
ADR-004 Day 13 shipped decision but zero scaffold code. "Aspirational scope if time permits" becomes "never starts". Sprint-3: lock Dashboard Phase 1 scaffold to Day 01-02 P0, not conditional.

### S4. Silent NPM blocker 4 days
No recurring escalation. Sprint-3: weekly explicit Andrea question in handoff header until resolved OR scope removed.

---

## Start (what to introduce)

### N1. Pre-sprint scoring script audit
Day 01 sprint-3: run `benchmark.cjs` in dry-mode, verify each metric's regex vs actual commit/file format. Prevents git_hygiene-style FPs.

### N2. Accessibility tooling baseline
Zero WCAG automated tooling in project. Sprint-3 P1: install `axe-core` via Playwright, emit baseline score, add to benchmark.

### N3. Worker uptime probe
No health check for Render/Hostinger/VPS services. Sprint-3 P2: lightweight probe script, ping every service, emit uptime % to benchmark. Unblocks `worker_uptime` metric (currently 0).

### N4. Latency log pipeline
UNLIM p95 unmeasured. Sprint-3 P2: add basic perf timestamp log → local aggregate → benchmark metric. Unblocks `unlim_latency_p95`.

### N5. Bundle dynamic-import plan
Main chunk 2205KB gz 1037KB, creeping toward 2500KB cap. Sprint-3 P1: split NewElabSimulator (1304KB) + react-pdf (1911KB) via dynamic import. Expected: –30% main.

### N6. Dashboard Phase 1 lock
Sprint-3 Day 01 P0: Edge Function `/dashboard-data` mock stub + `useDashboardData` hook. No more "conditional if time permits".

---

## Honest Gap Ledger (uncensored)

1. **Benchmark target missed** (4.17 vs 4.5). Shortfall rooted in unmeasured metrics; structural, not effort. Fix = instrumentation, not grinding.

2. **MCP discipline regressed Day 13** (3/target 10). Context overflow burned attention. Recovery Day 14.

3. **Dashboard feature logic not shipped** despite sprint-2 target "if scope permits". Reality: never permitted. Sprint-3 makes it non-optional.

4. **NPM blocker 4-day silence** = process gap. Should have escalated Day 12 explicit. Didn't.

5. **Benchmark git_hygiene FP** = undetected scoring bug for unknown duration. Lesson: trust-but-verify every scoring metric at sprint start.

6. **16 commits vs 25-40 target**: carry-over debt days produce fewer atomic PRs. Acceptable but monitor — could signal paralysis.

7. **No user-facing value Day 08-14**: teachers see identical app. Hygiene sprint inherent but worth acknowledging — sprint-3 must ship user-visible progress.

---

## Team Health Signals

**Good**:
- Zero burnout signals (sustainable daily cadence)
- Harness 2.0 pattern now muscle memory
- Honesty discipline held (no inflated claims sprint-2)

**Watch**:
- NPM blocker silence affects morale (stalled on external dep)
- Benchmark miss feels bad even when structural (acknowledge: miss ≠ failure)

---

## Action Items → Sprint 3

| ID | Action | Owner | Day |
|----|--------|-------|-----|
| A-301 | Audit benchmark.cjs regexes | DEV | sprint-3 Day 01 |
| A-302 | NPM decision explicit ask in sprint-3 kickoff | Andrea | Day 01 |
| A-303 | Dashboard `/dashboard-data` Edge Function scaffold | DEV | sprint-3 Day 01-02 |
| A-304 | axe-core accessibility baseline | DEV | sprint-3 Day 02 |
| A-305 | Worker uptime probe script | DEV | sprint-3 Day 03 |
| A-306 | UNLIM latency log pipeline | DEV | sprint-3 Day 03 |
| A-307 | Bundle dynamic-import refactor | DEV | sprint-3 Day 04 |
| A-308 | IF NPM approved: Vercel AI SDK 5 integration start | DEV | sprint-3 Day 04-07 |

---

## Sprint 2 Closed

**Status**: PARTIAL SUCCESS. Debt burned, process hardened, benchmark partial. Zero regression. Honest.

**Tag**: `sprint-2-close-2026-04-21` (to be applied Day 14 end).

**Next sprint kickoff**: see `automa/team-state/sprint-contracts/sett-3-sprint-contract.md`.
