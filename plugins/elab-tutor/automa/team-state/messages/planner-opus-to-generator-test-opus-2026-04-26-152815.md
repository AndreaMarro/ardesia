---
from: planner-opus
to: generator-test-opus
ts: 2026-04-26T152815
sprint: S-iter-3
priority: P0
blocking: true
---

## Task / Output

Generator-test-opus assigned 2 ATOMs iter 3 (P0 + P1):

### ATOM-S3-A1 — R0 re-run baseline post-deploy (P0 BLOCKING)
- File ownership: `scripts/bench/run-sprint-r0-edge.mjs` (NEW, copy template from run-sprint-r0-render.mjs)
- Endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` (Edge Function NOT Render)
- Auth: header `apikey: $SUPABASE_ANON_KEY` + `Authorization: Bearer $SUPABASE_ANON_KEY`
- Riusa fixture `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` (10 prompts identici iter 2)
- Riusa scorer `scripts/bench/score-unlim-quality.mjs` (12 PZ rules)
- Output 3 file timestamped: report.md + responses.jsonl + scores.json
- Threshold: ≥85% PASS, 70-84% WARN, <70% FAIL
- Atteso lift dramatic: plurale_ragazzi 0/10 → 7+/10 (post BASE_PROMPT v3 deploy)
- HIGHEST PRIORITY iter 3 — verifica deploy v3 quality lift

### ATOM-S3-B3 — Wiki retriever offline integration test (P1)
- File ownership: `tests/integration/wiki-retriever.test.js` (NEW)
- Loads corpus `docs/unlim-wiki/concepts/` (real markdown 59+ files)
- Uses `scripts/wiki-corpus-loader.mjs` + `scripts/wiki-query-core.mjs` makeRetriever
- 5+ test cases (led, ohm, delay, unknown, plural→singular)
- Each test asserts: kebab-case concept_name, body keyword match, score > threshold
- Baseline updates ≥12533 (or higher post add)

## Dependencies

- waits: []
- provides: [R0 delta measurement (validates deploy iter 2), wiki retriever test (unblocks B1 confidence + iter 4 RAG retrieval verify)]

## Acceptance criteria

- [ ] CoV 3x PASS (vitest ≥12532, build PASS, baseline preserved)
- [ ] file ownership respected (tests/ + scripts/bench/ only)
- [ ] R0 report.md committed con delta breakdown explicit
- [ ] wiki test PASS via `npx vitest run tests/integration/wiki-retriever.test.js`
- [ ] NO src/ writes
- [ ] NO supabase/ writes

## Skills consigliate (load via Skill tool)

- superpowers:test-driven-development
- full-stack-orchestration:test-automator
- agent-teams:team-review
- engineering:testing-strategy

## File completion message destination

`automa/team-state/messages/generator-test-opus-to-orchestrator-2026-04-26-<HHMMSS>.md`

## Execution order

1. ATOM-S3-A1 FIRST (P0 priority, R0 re-run blocks all other claims about deploy v3 quality)
2. ATOM-S3-B3 second (P1 supports iter 4 RAG verify)

## Hard rules

- NO src/ writes
- NO supabase/ writes (read-only)
- NO push main, NO merge senza Andrea
- Caveman mode chat replies, test code normal language
- Real corpus only (no mocks for integration test)
