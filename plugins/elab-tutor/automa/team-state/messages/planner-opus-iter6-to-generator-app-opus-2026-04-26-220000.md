---
from: planner-opus
to: generator-app-opus
ts: 2026-04-26T220000
sprint: S-iter-6
phase: 1
priority: P0
blocking: false
---

## Task / Output

Generator-app-opus iter 6 dispatch — 4 implementation tasks (P0 x2 + P1 x2).

## ATOMs assigned

| ATOM | Priority | File output | Estimate | Depends |
|------|----------|-------------|----------|---------|
| **ATOM-S6-A3** | P0 | `supabase/functions/_shared/tts.ts` + `supabase/functions/unlim-tts/index.ts` | 4.0h | none |
| **ATOM-S6-A4** | P0 | `src/services/multimodalRouter.js` (UPDATE routeTTS real) | 3.0h | A3 |
| **ATOM-S6-B1** | P1 | `scripts/openclaw/composite-handler.ts` (NEW) | 3.5h | A2 (architect) + A6 (gen-test) |
| **ATOM-S6-B3** | P1 | `supabase/functions/_shared/hybrid-rag.ts` + `src/services/hybridRagRetriever.js` | 4.5h | RAG ingest verify |

Total estimate: ~15h.

## Critical sequencing

```
A3 (TTS Edge Function) → A4 (multimodalRouter routeTTS real)
A2 (architect ADR-013) + A6 (gen-test composite tests) → B1 (composite real exec) [TDD red-green]
RAG ingest BG PID 89015 verify → B3 (hybrid retriever)
```

## Acceptance criteria common

- 3x CoV (vitest 12574+ PASS, build PASS, baseline preserved)
- TDD red-green per B1 (tests A6 RED → impl GREEN)
- ZERO regression
- vitest unit tests included (where applicable)
- error handling completo (timeout, 5xx, retry)

## Hard rules

- NO writes outside `src/`, `supabase/`, `scripts/openclaw/` (TS impl), `automa/team-state/messages/gen-app-*.md`
- NO docs/adrs, docs/audits writes
- NO push main, NO --no-verify
- Caveman ON
- Phase 1 parallel

## Phase 1 completion expected

`automa/team-state/messages/gen-app-opus-iter6-to-orchestrator-2026-04-26-<HHMMSS>.md`

Triggers Phase 2 scribe-opus dispatch.
