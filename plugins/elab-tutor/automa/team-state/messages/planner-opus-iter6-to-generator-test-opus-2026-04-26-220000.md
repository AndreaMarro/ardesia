---
from: planner-opus
to: generator-test-opus
ts: 2026-04-26T220000
sprint: S-iter-6
phase: 1
priority: P0
blocking: false
---

## Task / Output

Generator-test-opus iter 6 dispatch — 3 test tasks (P0 x2 + P1 x1).

## ATOMs assigned

| ATOM | Priority | File output | Estimate | Depends |
|------|----------|-------------|----------|---------|
| **ATOM-S6-A5** | P0 | `tests/e2e/02-vision-flow.spec.js` (5+ Playwright cases) | 3.5h | A1 (architect) |
| **ATOM-S6-A6** | P0 | `scripts/openclaw/composite-handler.test.ts` (8 vitest cases) | 3.0h | A2 (architect) |
| **ATOM-S6-B2** | P1 | `tests/unit/edge-tts-isabella.test.js` (15 cases) | 2.5h | A3 (gen-app) |

Total estimate: ~9h.

## Critical sequencing

```
A1 architect ADR-012 design → A5 Playwright Vision E2E spec
A2 architect ADR-013 design → A6 composite handler tests (TDD RED for B1 impl)
A3 gen-app TTS impl       → B2 edge-tts unit tests (15 cases)
```

## Acceptance criteria common

- 3x CoV (vitest baseline preserved 12574+, build PASS)
- TDD red-green: A6 tests RED initially (B1 impl not yet shipped Phase 1)
- ZERO regression
- mock fetch + window.__ELAB_API where needed
- skip cases ELAB_API_KEY missing (CI/local compat)
- timeout + retry config Playwright spec A5

## Hard rules

- NO writes outside `tests/`, `scripts/openclaw/*.test.ts`, `scripts/bench/`, `automa/team-state/messages/gen-test-*.md`
- NO writes src/, supabase/
- NO push main
- Caveman ON
- Phase 1 parallel

## Phase 1 completion expected

`automa/team-state/messages/gen-test-opus-iter6-to-orchestrator-2026-04-26-<HHMMSS>.md`

Triggers Phase 2 scribe-opus dispatch.
