# Sprint Contract Day 06 — sab 25/04/2026

**Sprint**: sett-1-stabilize (day 6/7)
**Branch**: feature/t1-003-render-warmup
**Format**: Harness 2.0 (Anthropic Apr 2026)

## Tasks (4 atomic, 2 P0 + 2 P1)

### P0-1 Vitest CoV 3x baseline verify

**Acceptance**:
- `npx vitest run` executed 3x
- N tests captured per run
- Zero flaky detected OR flaky docs
- Report `docs/audit/day-06-vitest-cov.md`

**Risk**: runtime ~90s/run × 3 = 5min turn budget

### P0-2 Sprint Review Day 07 demo script

**Acceptance**:
- `docs/reviews/sprint-1-review-prep.md` written
- 5 demo flow bullets (what to show)
- Scoreboard sett-1 trend
- Known gaps transparent

### P1-1 BLOCKER-002 closed (inline Day 06 TPM)

**Acceptance**:
- velocity-tracking.json backfill Day 04+05+06
- blockers.md BLOCKER-002 status CLOSED
- Learned appended

**Status**: DONE inline Day 06 TPM standup

### P1-2 Self-audit Day 06 20-dim matrix

**Acceptance**:
- `docs/audit/day-06-audit-2026-04-25.md`
- Metrics table Day 05 vs Day 06
- 4 grading (design/originality/craft/functionality)
- Auto-critica ≥5 gap
- Verdict READY/PARTIAL

## Success Metrics (4 grading)

- Design quality target: 7.5
- Originality target: 6 (hygiene day)
- Craft target: 8
- Functionality target: 9
- **Target media: 7.6-7.8/10**

## Out of Scope Day 06

- NO new feature code
- NO dashboard routing wiring (defer Day 07+)
- NO 152 dirty files triage (deferred sett-2)
- NO ADR-003 live verify (needs ANON key env)

## Definition of Done

- Tests preserved ≥12164
- Build PASS
- 4 artifacts written (standup, contract, CoV, review-prep, self-audit, handoff)
- Zero PZ v3 violations
- Zero engine semantic diff
- All commits pushed, CI attempted

## Stop Conditions Day 06

- Ctx compact 3x (currently 1x post-compact resume)
- Quota 429
- Blocker 5-retry-fail
- sett-end-gate = Day 07 (Domani)
