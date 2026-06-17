# Sprint 3 Contract — sett-3-stabilize-v3 (FINAL Day 01)

**Sprint**: 3/8 PDR 8-week
**Period**: 2026-04-22 (mar) → 2026-04-28 (lun), 7 days
**Branch**: `feature/sett-3-stabilize-v3`
**Format**: Harness 2.0
**Status**: FINAL — Option B locked (NPM pending → default)
**Based on**: sprint-2 retrospective A-301..A-308 + Day 14 integrity finding

---

## Sprint Goal (LOCKED Option B)

**Debt-safe benchmark lift + integrity remediation + dashboard Phase 1**.

Rationale NPM denied-by-default: BLOCKER-011 5 days silent → no authorization Vercel AI SDK 5 install. Option B requires zero new deps.

---

## Day 01 scope (2026-04-21, today)

P0 fixes (no NPM needed):
1. **CI e2e masking removal** — strip `|| echo "::warning..."` from `.github/workflows/e2e.yml` line 41. Job must fail honestly when specs fail.
2. **Stale spec triage** — specs 01-10 predate WelcomePage gate (222b630). Quick fix: bypass license gate via localStorage fixture + adjust expectation.
3. **Sprint-2 PR #17** created draft (HALT merge pending Andrea 4 decisions).

Scope docs + state:
4. Sprint-3 contract finalize Option B (this file)
5. Blockers carry-over list updated
6. claude-mem save observation Day 15

---

## 7-day Roadmap (Option B)

| Day | Date | Focus | P0 |
|-----|------|-------|-----|
| 01 | mar 22/04 | Integrity fix + scope lock + kickoff | CI e2e masking removal, stale specs fix, sett-3 contract FINAL |
| 02 | mer 23/04 | Scoring audit + Dashboard Edge Function stub | benchmark.cjs git_hygiene regex fix, Edge Function `dashboard-data` scaffold |
| 03 | gio 24/04 | Accessibility tooling baseline | axe-core install (dep approved pre-sprint) + baseline audit homepage + lezione route |
| 04 | ven 25/04 | Worker uptime probe + UNLIM latency log | probe script `scripts/worker-probe.sh`, unlim latency timestamps piped to Supabase `unlim_metrics` table |
| 05 | sab 26/04 | Dashboard live data wiring | hook + component render real data from Edge Function, feature flag gated |
| 06 | dom 27/04 | E2E spec 15 Dashboard + polish + benchmark | new spec `15-dashboard-live.spec.js`, audit Day 06 |
| 07 | lun 28/04 | Sprint review + retro + PR + deploy | gate + merge sett-3 PR + stress test |

---

## Carry-over from Sprint 2

### Blockers OPEN
| ID | Severity | Age | Owner | Plan |
|----|----------|-----|-------|------|
| BLOCKER-011 | P0 | 5 days | Andrea | Escalate Day 02 — no code change yet |
| BLOCKER-007 | P3 | ~2 weeks | DEV | render-warmup verify Day 04 |
| ADR-003 | P3 | ~1 week | Andrea | anon-key CLI verify Day 02 |

### Debt residual
- Dashboard Phase 1 scaffold (Day 02 Edge Function + Day 05 live)
- Benchmark git_hygiene regex fix (Day 02)
- Accessibility WCAG tooling (Day 03)
- Worker uptime probe (Day 04)
- UNLIM latency log pipeline (Day 04)
- Bundle dynamic-import refactor (deferred sprint-4)
- 5 ADR-004 open Qs Andrea input pending

---

## Success Metrics (Sprint end)

- **Tests**: ≥ 12170 (target +4 minimum, +50 stretch)
- **Benchmark**: ≥ 5.0/10 Option B
- **Auditor avg**: ≥ 7.5/10 (sprint-2 miss remediated)
- **Blockers closed**: 2/3 minimum
- **Commits**: 25-35 atomic
- **E2E spec**: 23+ (baseline 22 + spec 15)
- **E2E CI honesty**: no masking `|| echo` patterns in workflow
- **PZ v3 violations**: 0
- **Engine semantic diff**: 0
- **Dashboard live**: functional mock → real data by Day 05

---

## Definition of Done (sprint)

- [ ] NPM decision documented (approve OR deny OR defer with timeline)
- [ ] Scoring script regexes audited + fixed
- [ ] CoV 5x PASS end-of-sprint
- [ ] Build PASS
- [ ] Zero regression vs sprint-2 baseline 12166
- [ ] 4 benchmark gaps addressed (even partial)
- [ ] Retrospective + review done
- [ ] PR body draft ready
- [ ] Handoff sprint-3 complete
- [ ] 2+ blockers closed
- [ ] E2E CI no longer masks failures
- [ ] Dashboard Edge Function + hook render real-looking data

---

## Out of Scope Sprint 3

- Simulator engine changes (engine lock)
- Supabase schema migrations (coordinate Andrea)
- Deploy authorization (Andrea only)
- Major UI redesign beyond Dashboard
- Vercel AI SDK install (BLOCKER-011 pending)

---

## Stop Conditions

- Sett-end-gate Day 07 (lun 28/04)
- Quota 429 persistent
- Context compact > 3x
- Blocker hard 5-retry-fail

---

## 4-grading target (sprint avg)

- Design: 7.5
- Originality: 6.0 (Option B conservative)
- Craft: 8.0
- Functionality: 7.5
- **Target media**: 7.25/10

---

## Open Questions (Andrea needed)

1. NPM approval? (blocks sprint-4 scope)
2. Sprint-2 PR #17 merge OR keep as reference?
3. Deploy timing sprint-2 (if merged)
4. ADR-004 5 open Qs (teacher JWT, cost attribution, multi-classroom, retention, CSV export)
5. axe-core install authorization (dev-dep only, low risk) — needed Day 03
