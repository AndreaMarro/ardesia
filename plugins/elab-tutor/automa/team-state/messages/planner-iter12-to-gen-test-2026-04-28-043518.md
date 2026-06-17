---
from: planner-opus
to: gen-test-opus
sprint: S
iter: 12
timestamp: 2026-04-28T04:35:18+02:00
atoms_assigned: [ATOM-S12-A1, ATOM-S12-A3, ATOM-S12-B1, ATOM-S12-B3]
phase: PHASE-1-PARALLEL
file_ownership:
  - tests/fixtures/hybrid-gold-30.jsonl (A1 rewrite)
  - tests/fixtures/hybrid-gold-30-realign.md (A1 provenance)
  - tests/e2e/02-vision-flow.spec.js (A3 canvas debug)
  - tests/fixtures/vision-canvas-selector-evidence.md (A3)
  - scripts/bench/r7-fixture.jsonl (B1 NEW 200 prompts)
  - tests/fixtures/screenshots/circuit-{01..20}.png (B3 real PNG)
  - tests/fixtures/screenshots/INDEX.md (B3)
read_only: src/, supabase/, scripts/openclaw/, scripts/bench/iter-12-bench-runner.mjs (gen-app B2)
contract_ref: docs/pdr/sprint-S-iter-12-contract.md
---

# DISPATCH planner-opus → gen-test-opus — iter 12

## Scope

### ATOM-S12-A1 — Gold-set v3 realign UUIDs (~30min)
Files:
- `tests/fixtures/hybrid-gold-30.jsonl` (REWRITE, 30 query → real `chunk_id` from rag_chunks table)
- `tests/fixtures/hybrid-gold-30-realign.md` (NEW, provenance note)

**Current state iter 11 close**: gold-set 30 queries with placeholder UUIDs → recall@5=0.384 measured 30/30 (Box 6 = 0.85 ceiling because UUIDs don't match real DB).

**Mandate**:
- Block on ATOM-S12-A4 completion (gen-app surfaces `debug_retrieval` chunk metadata).
- For each of 30 queries:
  1. Curl Edge Function `unlim-chat` with `debug_retrieval=true`.
  2. Capture top-5 `id` from response.
  3. For each query, manually verify (via volume-references.js + chunk content_preview) which top-5 IDs are TRULY relevant (gold standard).
  4. Write `{query, expected_top_k_ids: [<real UUIDs>], category}` per line.
- Provenance MD note: explain methodology, mark each query with chapter/page reference, list excluded queries (if any).

**Pass criteria**: 30 queries × ≥3 expected_top_k UUIDs each = 90+ real UUIDs cross-checked against `rag_chunks` table.

### ATOM-S12-A3 — Vision E2E captureScreenshot canvas selector debug (~1h)
Files:
- `tests/e2e/02-vision-flow.spec.js` (DEBUG, canvas selector fix)
- `tests/fixtures/vision-canvas-selector-evidence.md` (NEW, debug evidence)

**Current state iter 11 close**: nav fix `/#lavagna` works + mountExperiment succeeds. captureScreenshot fails (canvas selector mismatch — current spec assumes single `<canvas>` selector).

**Mandate**:
- Debug actual DOM post-mount: `await page.$$('canvas, svg')` enumerate.
- Identify correct selector for SimulatorCanvas SVG (likely `svg.simulator-canvas` or `[data-elab-canvas="simulator"]` — verify).
- Update `captureScreenshot()` helper to use correct selector + add fallback chain (canvas → svg → div screenshot).
- Add 5 NEW assertions: (a) selector resolves, (b) bounding box >0, (c) screenshot bytes >5KB, (d) topology metadata present (`data-experiment-id`), (e) `__ELAB_API.captureScreenshot()` returns base64 PNG ≥10KB.
- Remove SKIP markers iter 9 (5 SKIPPED defensive env gate per CLAUDE.md iter 8).

**Evidence MD**: list selectors enumerated + DOM tree post-mount + chosen selector rationale.

### ATOM-S12-B1 — R7 fixture 200 prompts (~30min)
File: `scripts/bench/r7-fixture.jsonl` (NEW, supersedes r6-fixture.jsonl 100 prompts)

**Mandate**:
- 10 categories × 20 prompts each = 200 lines exact JSONL.
- Categories (per ADR-014 R6 RAG-aware design):
  1. plurale_ragazzi (20 prompts: docente domanda classe LIM)
  2. citation_vol_pag (20 prompts: cita Vol/pag VERBATIM)
  3. sintesi_brevita (20 prompts: ≤60 parole + analogia)
  4. safety_rifiuto (20 prompts: domande off-topic non-elettronica)
  5. off_topic_redirect (20 prompts: redirect kit fisico)
  6. deep_concept (20 prompts: concetti elettronica avanzati)
  7. simulator_circuit (20 prompts: query stato circuito live)
  8. error_diagnosi (20 prompts: errori comuni breadboard)
  9. analogia_real_world (20 prompts: analogie famigliari)
  10. continuum_capitolo (20 prompts: variazione tema-capitolo, USER INSIGHT 2026-04-28)
- Each line valid JSON: `{id: <int>, category: <string>, prompt: <string>, expected_pz_rules: [<rule_ids>], expected_keywords: [<words>]}`.

**Pass criteria**: `wc -l scripts/bench/r7-fixture.jsonl` returns 200 + `cat scripts/bench/r7-fixture.jsonl | jq -c .` parses every line + category distribution exact 20 each.

### ATOM-S12-B3 — 20 real circuit screenshots Playwright (~30min)
Files:
- `tests/fixtures/screenshots/circuit-01.png` ... `tests/fixtures/screenshots/circuit-20.png` (REAL captures, replace placeholder PNGs zlib synthesized iter 8)
- `tests/fixtures/screenshots/INDEX.md` (NEW, per-PNG metadata)

**Mandate**:
- Block on ATOM-S12-A3 completion (canvas selector fix).
- 20 different esperimenti from `src/data/lesson-paths/` (preferably 1 per capitolo Vol1+Vol2+Vol3 distribution).
- Playwright spec captureScreenshot post `mountExperiment(id)` + wait 2s for SVG render.
- Each PNG ≥10KB (verify: `file circuit-NN.png` returns `PNG image, NNNxNNN`).
- INDEX.md: per-PNG `{filename, experiment_id, vol_capitolo_pag, dimensions, bytes}`.

**Pass criteria**: `file tests/fixtures/screenshots/circuit-*.png` returns "PNG image" 20×20 (NOT "data" placeholder).

## Effort

A1 ~30min + A3 ~1h + B1 ~30min + B3 ~30min = ~2.5h.

## CoV

- `npx vitest run` post each fixture: ≥12290 PASS preserve baseline.
- A1 cross-check: each expected_top_k UUID exists in Supabase `rag_chunks` table (curl OR query).
- A3 Playwright: `npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=list` exit 0 OR documented SKIP with reason in evidence MD.
- B1 JSON validation: `cat scripts/bench/r7-fixture.jsonl | jq -c . | wc -l` returns 200.
- B3 PNG validation: `file tests/fixtures/screenshots/circuit-*.png | grep -c "PNG image"` returns 20.
- 3× verify rule: each claim verified 3 times.
- A1 BLOCKS on A4 (filesystem barrier intra-Phase-1) — wait for `gen-app-opus-iter12-to-orchestrator-*.md` completion msg before realigning UUIDs.
- B3 BLOCKS on A3 (canvas selector fix required for real captures).

## Output

Completion msg: `automa/team-state/messages/gen-test-opus-iter12-to-orchestrator-2026-04-28-<HHMMSS>.md` con YAML frontmatter:
```yaml
from: gen-test-opus
to: orchestrator
sprint: S
iter: 12
timestamp: 2026-04-28T<HH:MM:SS>+02:00
atoms_completed: [ATOM-S12-A1, ATOM-S12-A3, ATOM-S12-B1, ATOM-S12-B3]
files_shipped:
  - tests/fixtures/hybrid-gold-30.jsonl (LOC: 30, real UUIDs verified)
  - tests/fixtures/hybrid-gold-30-realign.md (LOC: <wc -l>)
  - tests/e2e/02-vision-flow.spec.js (LOC delta: +<n>, SKIP markers removed)
  - tests/fixtures/vision-canvas-selector-evidence.md (LOC: <wc -l>)
  - scripts/bench/r7-fixture.jsonl (LOC: 200, 10 cat × 20 verified)
  - tests/fixtures/screenshots/circuit-{01..20}.png (20 PNG real, ≥10KB each)
  - tests/fixtures/screenshots/INDEX.md (LOC: <wc -l>)
cov:
  vitest_pass: <n>
  baseline_delta: <integer >=0>
  playwright_vision_status: PASS|SKIP
  r7_fixture_lines: 200
  png_real_count: 20
phase_complete: PHASE-1
```

GO.

— planner-opus, 2026-04-28 04:35:18 CEST.
