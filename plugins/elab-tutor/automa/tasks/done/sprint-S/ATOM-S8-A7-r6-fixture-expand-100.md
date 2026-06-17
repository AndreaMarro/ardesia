---
id: ATOM-S8-A7
sprint: S-iter-8
priority: P0
owner: gen-test-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Expand R6 stress fixture from iter 6 seed 10 prompts to 100 prompts RAG-aware (10 categorie × 10 prompts).

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (read-only existing fixture iter 6 + add new file)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `scripts/bench/r6-fixture-100.jsonl` + `automa/team-state/messages/gen-test-*.md`
- [ ] 100 prompts total, valid JSONL one-per-line
- [ ] 10 categories × 10 prompts exact distribution per BENCHMARK-SUITE-ITER-8 §B1:
  1. plurale_ragazzi: 10
  2. citation_vol_pag: 10
  3. sintesi_60w: 10
  4. safety_minor: 10
  5. off_topic_redirect: 10
  6. deep_concept: 10
  7. experiment_mount: 10
  8. error_diagnosis: 10
  9. vision_describe: 10
  10. clawbot_composite: 10
- [ ] Schema per prompt: `{id, category, prompt, expected_intent?, expected_citation?, expected_word_count_max?}`
- [ ] Prompts iter 6 seed (10) preserved as subset, 90 NEW prompts added
- [ ] PRINCIPIO ZERO compliance: prompts test plurale "Ragazzi,", citazioni Vol/pag, sintesi ≤60w
- [ ] MORFISMO compliance: deep_concept prompts use kit Omaric component names + volume capitoli ordine

## Output files
- `scripts/bench/r6-fixture-100.jsonl` (NEW, 100 lines, ~30-50 KB)
- `automa/team-state/messages/gen-test-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion or batched A5/A8/A11)

## Done when
File exists, `wc -l scripts/bench/r6-fixture-100.jsonl` returns 100, JSONL valid, 10 categories present.
