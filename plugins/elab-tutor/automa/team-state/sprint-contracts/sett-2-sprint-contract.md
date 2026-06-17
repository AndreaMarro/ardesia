# Sprint 2 Contract — sett-2-stabilize-v2

**Sprint**: sett-2 (n. 2/8 PDR Ambizioso)
**Period**: 2026-04-21 (mar) → 2026-04-27 (lun), 7 days
**Branch**: feature/sett-2-stabilize-v2
**Format**: Harness 2.0 (Sprint Contract pre-implementation, 4-grading post)
**Status**: ACTIVE Day 01

## Sprint Goal

Stabilize sprint-1 carry-over debt + formalize Agile Scrum process foundations + raise benchmark floor 3.95 → 4.5 minimum. Keep PZ v3 + engine invariants. Establish Product Backlog gerarchico (BLOCKER-004 closure).

**Non-goal**: no new major features. Hygiene + process sprint.

## Carry-over from Sprint 1

### Blockers OPEN

| ID | Severity | Owner | Plan |
|----|----------|-------|------|
| BLOCKER-003 | P1 | Andrea+DEV | 152 dirty files triage Day 02-03 |
| BLOCKER-004 | P2 | TPM | Product backlog Day 01 (this contract) |
| BLOCKER-005 | P3 | DEV | no-regression --dry-run Day 01 |
| BLOCKER-007 | P2 | DEV | render-warmup.yml first run verify Day 02 (post-merge) |
| BLOCKER-008 | P2 | TPM | grep canonical invariant on main Day 02 |
| ADR-003 | P3 | Andrea | Accepted promotion (needs ANON key CLI verify) |

### Debt residual

- Vision E2E CoV 1x → target 3x (sett-2 Day 03)
- "Test N" commit marker discipline (enforce all sett-2 commits)
- MCP calls 8+/day (sett-2 target: floor 10/day)
- T1-005 Dashboard scaffold → feature logic (sett-2 Day 04-06 if scope holds)

## 7-day roadmap (preliminary, adjust per daily standup)

| Day | Date | Focus | P0 artifacts |
|-----|------|-------|--------------|
| 01 | mar 21/04 | Sprint planning + backlog + blocker-005 | sett-2-contract, day-01-contract, product-backlog.md, standup, no-regression --dry-run |
| 02 | mer 22/04 | Dirty files triage + BLOCKER-007/008 | triage report, post-merge verify script |
| 03 | gio 23/04 | Vision E2E CoV 3x + MCP discipline | vision-cov-3x.md, mcp-log-day03.md |
| 04 | ven 24/04 | T1-005 Dashboard feature logic start | feature plan + first commit |
| 05 | sab 25/04 | T1-005 Dashboard continue + E2E | spec extension |
| 06 | dom 26/04 | Buffer + review prep + audit | review-prep-sprint2.md |
| 07 | lun 27/04 | Sprint review + retrospective | retrospective sprint-2.md, handoff |

## Success Metrics (Sprint end)

- **Tests**: ≥12164 (floor sprint-1), target 12200+
- **Benchmark**: ≥4.5/10 (+0.55 from 3.95)
- **Auditor avg**: ≥7.5/10 (sprint-1 7.35 baseline)
- **Blockers closed**: 3/6 minimum (BLOCKER-004, 005, 007)
- **Commits**: 25-40 (atomic, meaningful)
- **E2E spec**: 14+ (from 12)
- **PZ v3 violations**: 0
- **Engine semantic diff**: 0
- **Dashboard**: feature logic landed (if scope permits Day 04-06)

## Definition of Done (sprint)

- [ ] All P0 artifacts written
- [ ] CoV 3x PASS end-of-sprint
- [ ] Build PASS
- [ ] Zero regression vs sprint-1 baseline
- [ ] Retrospective + review prep complete
- [ ] PR body draft ready
- [ ] Handoff finale
- [ ] 3+ blockers closed
- [ ] Product backlog formalized

## Out of Scope Sprint 2

- Major UNLIM refactor (defer sett-3+)
- New simulator features (defer)
- Compiler rewrites (defer)
- Supabase schema migrations (out)
- Production deploy authorization (Andrea only)

## Stop Conditions

- Sett-end-gate = Day 07 (lun 27/04)
- Quota 429 persistente
- Context compact > 3x
- Blocker hard 5-retry-fail

## 4-grading target (sprint avg)

- Design quality: 7.5
- Originality: 6.5 (hygiene sprint, low originality expected)
- Craft: 8.0
- Functionality: 8.0
- **Target media**: 7.5/10

## Brutal-honest note

Sprint 2 is hygiene/process sprint. Benchmark delta modest by design. Dashboard feature logic is aspirational — if carry-over debt consumes first 4 days, Dashboard slips to sprint-3. Transparent acknowledgment.
