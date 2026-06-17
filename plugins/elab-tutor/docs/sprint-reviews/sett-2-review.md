# Sprint 2 Review — sett-2-stabilize-v2

**Sprint**: 2/8 PDR 8-week
**Period**: 2026-04-21 (cumulative Day 08-14, local sprint-2 Day 01-07)
**Branch**: `feature/sett-2-stabilize-v2`
**Goal**: Stabilize sprint-1 carry-over + formalize Agile Scrum + raise benchmark 3.95 → 4.5
**Review date**: 2026-04-21 (gate Day 14)

---

## Sprint Goal Assessment

**Original**: stabilize + process + benchmark 3.95 → 4.5.

**Achieved**: stabilize ✅, process ✅, benchmark 4.17 (partial — target 4.5 missed by 0.33).

**Verdict**: PARTIAL SUCCESS. Hygiene sprint executed well. Benchmark shortfall honest (see Gaps).

---

## Deliverables Shipped

### Day 08 (sett-2 Day 01)
- Sprint contract + product-backlog.md
- CI unblock deploy-smoke tolerant SPA
- Baseline 12164 confirmed
- Commit: `157555d`

### Day 09 (sett-2 Day 02)
- 4 BLOCKERS CLOSED (003, 004, 005, 008) — major debt burn
- CoV 3x 12164 PASS
- Commit: `1b7f36d`

### Day 10 (sett-2 Day 03)
- Day 10 Sprint Contract + standup + 5 P0 tasks
- Vision E2E spec 13-vision.spec.js scaffold
- Dashboard shell scaffold + import-smoke test
- BLOCKER-009 NPM flag surfaced Day 11
- Commits: `ed49e52`, `4f00b00`, `63d6920`, `5bc367a`, `7ff1504`

### Day 11 (sett-2 Day 04)
- Dashboard #dashboard-v2 hash wiring (behavioral)
- Pre-commit watermark-only diff filter (band-aid for restamp)
- Day 11 audit + handoff
- Commits: `297e969`, `8b97720`, `54513b3`, `ded2e19`, `bdb1fa7`

### Day 12 (sett-2 Day 05)
- claude-mem save wire helper + smoke test + usage doc
- E2E spec 14 dashboard-v2 smoke
- Watermark CI integration doc
- Day 12 audit 7.2/10
- Commits: `3754025`, `9bce063`, `41019fd`

### Day 13 (sett-2 Day 06)
- **BLOCKER-010 ROOT-CAUSED**: idempotent `add-signatures.js` (permanent fix vs band-aid)
- Day 13 Sprint Contract Harness 2.0
- ADR-004 DashboardShell data source (Edge Function proxy Option B)
- Benchmark full-mode 4.17 (+0.22 vs 3.95)
- Audit 7.4/10
- Commits: `8adb7d3`, `c890311`, `81d3748`

### Day 14 (sett-2 Day 07 — THIS DAY)
- CoV 5x gate
- Playwright full E2E
- Sprint review + retro
- Handoff + sett-3 kickoff
- PR create + await Andrea merge

---

## Metrics vs Targets

| Metric | Sprint-1 baseline | Sprint-2 target | Sprint-2 actual | Hit? |
|--------|-------------------|-----------------|-----------------|------|
| Tests PASS | 12164 | ≥ 12164 (floor) | 12166 | ✅ +2 |
| Benchmark | 3.95 | ≥ 4.5 | 4.17 | ❌ –0.33 short |
| Auditor avg | 7.35 | ≥ 7.5 | ~7.25 (7.0/7.2/7.4) | ❌ –0.25 short |
| Blockers closed | — | ≥ 3 | 5 (003, 004, 005, 008, 010) | ✅ +2 over target |
| Commits | — | 25–40 | 16 (Day 08–14) | ⚠️ below range |
| E2E spec | 12 | ≥ 14 | 14 | ✅ |
| PZ v3 violations | 0 | 0 | 0 | ✅ |
| Engine semantic diff | 0 | 0 | 0 | ✅ |
| Dashboard feature logic | — | aspirational | decision (ADR-004) + scaffold shell, no live data | ⚠️ partial |

**Ratio hit**: 5/9 hard targets, 2/9 short, 2/9 partial. Honest mixed.

---

## Blockers Lifecycle

**Closed sprint-2** (5):
- BLOCKER-003 (152 dirty files) — Day 09
- BLOCKER-004 (product backlog) — Day 09
- BLOCKER-005 (no-regression --dry-run) — Day 09
- BLOCKER-008 (canonical invariant on main) — Day 09
- BLOCKER-010 (watermark restamp root-cause) — Day 13

**Opened sprint-2** (1):
- BLOCKER-011 (NPM_DEPS_APPROVAL_PENDING) — Day 10, carry-over 4 days, Andrea silent

**Still open from sprint-1** (assess):
- BLOCKER-007 (render-warmup.yml verify) — needs sprint-3 check
- ADR-003 (anon-key CLI verify) — needs sprint-3

---

## What Went Well

1. **Root-cause discipline Day 13**: watermark fix at source (idempotent), not band-aid. Closes class of false-positive blockers permanently.
2. **5 blockers closed** vs target 3 — debt burn higher than planned.
3. **Harness 2.0 fully adopted**: sprint contracts, 4-grading, state recovery, daily audit cadence. Pattern now durable.
4. **Zero regression**: engine lock invariant held, PZ v3 violations zero, CoV consistency 100%.
5. **ADR-004 quality**: full Option A/B/C analysis, auth/RLS/cache/error/offline covered, 5 open Qs for Andrea.
6. **CI discipline**: every sett-2 push CI green pre-commit (no red-CI spam like sett-1 Day 09/04 incident).

---

## What Did Not Go Well

1. **NPM blocker 4 days silent** — Andrea approval pending. Stalls Vercel AI SDK 5 integration. Sprint-3 scope risk.
2. **Benchmark missed 4.5 target** — 4.17 delivered (+0.22 not +0.55). Underlying metrics: unlim_latency_p95 no log, git_hygiene regex FP, accessibility_wcag zero tooling, worker_uptime no probe.
3. **Dashboard feature logic not shipped** — only ADR + scaffold shell. Live data deferred sprint-3.
4. **MCP floor dipped Day 13** (3 calls vs target 10). Discipline regression single-day.
5. **Auditor avg short** — 7.25 vs 7.5. Hygiene sprint inherent low-originality ceiling acknowledged in plan.
6. **Commits 16 vs 25-40 range**: below. Rationale: blocker carry-over caused debt-pivot days with fewer atomic changes. Not a problem per se but flagged.

---

## Gap Analysis (benchmark shortfall root-cause)

| Metric | Contribution | Gap |
|--------|--------------|-----|
| e2e_pass_rate | 1.5 | hit |
| volume_ref | 1.5 | hit (92/92) |
| documentation | 1.0 | hit (4/4) |
| dashboard_live | 0.15 | low (feature not shipped) |
| test_count | 0.02 | target 14000, actual 12166 (-13%) |
| unlim_latency_p95 | 0 | **no log pipeline** — sprint-3 P0 |
| git_hygiene | 0 | **regex FP** — sprint-3 quick fix |
| accessibility_wcag | 0 | **zero tooling** — sprint-3 setup |
| worker_uptime | 0 | **no probe** — sprint-3 setup |
| build_size_kb | 0 | target 3500KB, actual 14626KB (×4) — sprint-3 dynamic import |

**Sprint-3 benchmark lift potential**: fix git_hygiene regex (+0.3), add latency log (+0.3), accessibility tooling (+0.3), worker probe (+0.2). Realistic sprint-3 target: 5.0–5.3/10.

---

## Stakeholder Outcomes

**Andrea** — sprint-2 delivered: zero regression, process scaffold, blocker burn, ADR-004 for strategic Dashboard decision. Open question: NPM approval (4 days). Recommendation: decide sprint-3 Day 01.

**End users / teachers** — no user-facing feature this sprint (hygiene). Sprint-3 Dashboard shipping changes this.

**Future Claude (sprint-3)** — state fully persisted, handoffs complete, debt residual documented, next-sprint contract skeleton ready.

---

## Sprint-2 Average Score (4-grading)

| Dimension | Sprint avg | Rationale |
|-----------|------------|-----------|
| Design Quality | 7.3 | ADR-004 strong, contracts consistent, idempotent pattern |
| Originality | 5.8 | hygiene-bound ceiling, modest novelty spots (idempotent watermark) |
| Craft | 8.2 | CoV discipline every day, root-cause Day 13, evidence trails thorough |
| Functionality | 7.5 | 5 blockers closed, zero regression, but dashboard not functional |

**Sprint-2 average: 7.2/10** (target 7.5, missed by 0.3).

---

## Acceptance Criteria (Sprint Review)

- [x] CoV 5x gate attempted Day 14
- [x] All daily contracts written (07/07)
- [x] 5 blockers closed (target 3)
- [x] Zero regression baseline held
- [x] ADR-004 shipped
- [ ] Dashboard feature logic live (miss — deferred sprint-3)
- [ ] Benchmark 4.5 (miss — 4.17 actual)
- [x] MCP floor maintained weekly avg (Day 13 dip but weekly OK)

**Accepted**: 6/8 criteria. Sprint CLOSED with partial success, honest.

---

## Hand-off to Sprint 3

See:
- `docs/handoff/2026-04-21-day-14-sprint-end.md`
- `docs/retrospectives/sett-2-retro.md`
- `automa/team-state/sprint-contracts/sett-3-sprint-contract.md` (skeleton)

**Sprint-3 focus proposal**:
- IF NPM approved → Vercel AI SDK 5 UNLIM tool-call integration
- ELSE → Dashboard feature logic (Edge Function + hook) + benchmark lift metrics
