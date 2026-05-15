---
id: ATOM-S8-A10
sprint: S-iter-8
priority: P0
owner: gen-app-opus
phase: 1
deps: [ATOM-S8-A9]
created: 2026-04-27
---

## Task
Implement master orchestrator `scripts/bench/iter-8-bench-runner.mjs` (7-suite, sequential B1+B3+B4+B6+B7, parallel B2+B5).

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/bench/iter-8-bench-runner.mjs` + `automa/team-state/messages/gen-app-*.md`
- [ ] Pre-flight check: env vars (SUPABASE_URL, SERVICE_ROLE_KEY, ELAB_API_KEY), services up (curl health endpoints), baseline test PASS (`npx vitest run --reporter=basic | tail -1` ≥12599)
- [ ] Sequential B1 (R6 stress) → B3 (Vision E2E) → B4 (TTS Isabella) → B6 (Cost) → B7 (Fallback chain)
- [ ] Parallel pair: B2 (Hybrid RAG) + B5 (ClawBot composite) launched concurrently mid-pipeline
- [ ] Aggregator: each suite peso 1.0, total 7/7 = SPRINT_S iter 8 GREEN
- [ ] Output unified report `docs/bench/iter-8-results-{ts}.md` + JSON dashboard `docs/bench/iter-8-results-{ts}.json`
- [ ] Exit code: 0 = ALL pass, 1 = any fail with per-suite detail
- [ ] Pass criteria iter 8 close per BENCHMARK-SUITE-ITER-8 §ORCH:
  - B1 R6: ≥87% global + 10/10 categorie ≥85%
  - B2 Hybrid RAG: recall@5 ≥0.85
  - B3 Vision E2E: latency p95 <8s + topology ≥80%
  - B4 TTS Isabella: latency p50 <2s + MOS ≥4.0
  - B5 ClawBot: success ≥90%
  - B6 Cost: <€0.012/session
  - B7 Fallback: gate accuracy 100%
- [ ] Score gate: 7/7=9.2, 6/7=8.7 target ONESTO, 5/7=8.2, ≤4/7=7.5 stuck
- [ ] PRINCIPIO ZERO + MORFISMO compliance N/A (orchestrator is tooling)

## Output files
- `scripts/bench/iter-8-bench-runner.mjs` (NEW, ~300-500 LOC)
- `automa/team-state/messages/gen-app-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched)

## Done when
Runner script exists, `node scripts/bench/iter-8-bench-runner.mjs --help` shows usage, dry-run mode validates pre-flight.
