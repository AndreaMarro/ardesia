---
from: planner-opus
to: scribe-opus
ts: 2026-04-26T220000
sprint: S-iter-6
phase: 2
priority: P2
blocking: true
---

## Task / Output

Scribe-opus iter 6 dispatch — Phase 2 SEQUENTIAL AFTER Phase 1 completion.

## ATOM assigned

| ATOM | Priority | File output | Estimate |
|------|----------|-------------|----------|
| **ATOM-S6-C2** | P2 | audit + handoff + CLAUDE.md append iter 6 close | 3.5h |

## Phase 2 trigger

**WAIT** for Phase 1 completion messages before starting:
- `automa/team-state/messages/architect-opus-iter6-to-orchestrator-2026-04-26-*.md`
- `automa/team-state/messages/gen-app-opus-iter6-to-orchestrator-2026-04-26-*.md`
- `automa/team-state/messages/gen-test-opus-iter6-to-orchestrator-2026-04-26-*.md`

Filesystem barrier check:
```bash
ls automa/team-state/messages/*-iter6-to-orchestrator-2026-04-26-*.md | wc -l
# expected ≥3 (architect + gen-app + gen-test before scribe starts)
```

## Deliverables

- `docs/audits/2026-04-26-sprint-s-iter6-PHASE2-FINAL-audit.md` (~290 righe)
- `docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md` (~280 righe)
- `CLAUDE.md` append section "## Sprint S iter 6 close (2026-04-26 ...)" (~80 righe)

## Acceptance criteria

- 3x CoV file system verify ALL ATOM-S6-* deliverables shipped (avoid race-cond stale audit iter 3 lesson)
  - architect: `docs/adrs/ADR-012-*.md` + `docs/adrs/ADR-013-*.md` + (optionally) `docs/adrs/ADR-014-*.md`
  - gen-app: `supabase/functions/_shared/tts.ts` + `supabase/functions/unlim-tts/index.ts` + `src/services/multimodalRouter.js` (routeTTS real) + (optionally) `scripts/openclaw/composite-handler.ts` + (optionally) `supabase/functions/_shared/hybrid-rag.ts`
  - gen-test: `tests/e2e/02-vision-flow.spec.js` + `scripts/openclaw/composite-handler.test.ts` + (optionally) `tests/unit/edge-tts-isabella.test.js`
- score ONESTO 10 boxes (NO inflation, target 7.5+/10)
- Pattern S Phase 2 SEQUENTIAL AFTER Phase 1 confirmation documented
- handoff activation string iter 7 included
- CLAUDE.md ZERO bloat — append only iter 6 section, do NOT rewrite history

## Hard rules

- Phase 2 SEQUENTIAL — NO start before Phase 1 done
- NO writes src/, tests/, supabase/, docs/adrs/
- Caveman ON
- 3x CoV final

## Phase 2 completion expected

`automa/team-state/messages/scribe-opus-iter6-to-orchestrator-2026-04-26-<HHMMSS>.md`

Triggers Phase 3 orchestrator stress test prod (ATOM-S6-C3).
