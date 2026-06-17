---
from: generator-test-opus
to: orchestrator
sprint: S
iter: 2
timestamp: 2026-04-26T09:49:46Z
status: COMPLETE
---

# generator-test-opus → orchestrator | Sprint S iter 2 deliverables

## Deliverable 1 — Sprint R0 Render Baseline (Task C)

**Status**: MEASURED LIVE on production endpoint `https://elab-galileo.onrender.com/chat`

**Files**:
- Runner: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/run-sprint-r0-render.mjs` (NEW)
- Raw responses: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/output/r0-render-responses-2026-04-26T09-35-59-692Z.jsonl`
- Scorer JSON: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/output/r0-render-scores-2026-04-26T09-35-59-692Z.json`
- Markdown report: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/bench/output/r0-render-report-2026-04-26T09-35-59-692Z.md`

**Numeric results (10/10 prompts succeeded, ZERO failures)**:
- **Overall PZ score: 75.8% (65.5/86.4) → WARN** (target ≥85%)
- Avg latency: 15703ms (Render warm; first call 27s cold start)
- Avg word count: 55 (PZ target ≤60 OK)

**Per-fixture pass %**:
| ID | Scenario | Score |
|----|----------|-------|
| r0-001 | introduce-concept | 79% |
| r0-002 | debug-circuit | 87% |
| r0-003 | verify-comprehension | 71% |
| r0-004 | capitolo-intro | 72% |
| r0-005 | off-topic | 67% |
| r0-006 | deep-question | 65% |
| r0-007 | safety-warning | 77% |
| r0-008 | action-request | 87% |
| r0-009 | narrative-transition | 87% |
| r0-010 | book-citation-request | 69% |

**Failure clusters** (priority for Task A wire-up impact):
1. `plurale_ragazzi` — **10/10 FAIL** (HIGH) → BIGGEST GAP. UNLIM never starts with "Ragazzi"
2. `citation_vol_pag` — 5/10 FAIL (MEDIUM) → no Vol.N pag.X citation when expected
3. `max_words` — 3/10 FAIL (HIGH) → r0-003, r0-006, r0-010 over 60 words
4. `off_topic_recognition` — 1/1 FAIL (HIGH) → r0-005 didn't say "fuori scope"
5. `no_chatbot_preamble` — 2/10 FAIL (HIGH) → r0-004, r0-005
6. `analogia` — 1/10 FAIL (MEDIUM) → r0-006 deep PWM question

**Sprint S iter 1 caveat #2 ADDRESSED**: Scorer accepts POSITIONAL `<responses.jsonl>` arg (verified line 214 of `score-unlim-quality.mjs`), NOT `--responses --fixture` flags. Runner uses positional shape correctly.

## Deliverable 2 — TDD Test Scaffolds (Task A red-then-green phase)

**Files created** (3 absolute paths):
1. `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/tests/unit/buildCapitoloPromptFragment.test.js` — 9 tests
2. `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/tests/unit/principioZeroValidator.test.js` — 19 tests + 8 it.todo
3. `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/tests/integration/unlim-chat-prompt-v3.test.js` — 6 tests

**Important discovery**: generator-app-opus has ALREADY implemented both:
- `supabase/functions/_shared/capitoli-loader.ts` → `buildCapitoloPromptFragment(capitolo, experimentId)`
- `supabase/functions/_shared/principio-zero-validator.ts` → `validatePrincipioZero(response, ctx)`

So tests are GREEN, not red. They serve as regression guards going forward.

**Coverage of 12 PZ rules** in unit tests:
| Rule | Runtime test | Bench-time only |
|------|-------------|-----------------|
| imperativo_docente | YES (3 tests) | - |
| singolare_studente | YES (2 tests) | - |
| max_words_60 | YES (3 tests) | - |
| no_citation_concept_intro | YES (3 tests, conditional) | - |
| english_filler | YES (2 tests) | - |
| chatbot_preamble | YES (2 tests) | - |
| plurale_ragazzi | - | YES (it.todo, fixture-dependent) |
| citation_vol_pag | - | YES (it.todo, fixture flag) |
| analogia | - | YES (it.todo, fixture flag) |
| no_verbatim_3plus_frasi | - | YES (it.todo, RAG-source diff) |
| synthesis_not_verbatim | - | YES (it.todo, RAG sources) |
| off_topic_recognition | - | YES (it.todo, fixture scenario) |
| humble_admission | - | YES (it.todo, fixture scenario) |
| action_tags_when_expected | - | YES (it.todo, fixture metadata) |

(That is, 6 runtime + 8 deferred. The validator implementation correctly defers fixture-aware rules to bench-time scorer.)

## Vitest Baseline Delta

- Before: 12498 PASS (per Sprint S iter 2 contract gate)
- After: **12532 PASS | 8 todo** (211 PASS files / 231 → all suite runs clean)
- Delta: **+34 PASS, +8 todo, ZERO regressions**
- Verification: `npx vitest run 2>&1 | tail -10` → "Tests 12532 passed | 8 todo"
- Anti-regression gate: PASS

## Suggestions for generator-app-opus on order of implementation

The shared helpers exist. Remaining work in Task A is the **wire-up in `unlim-chat/index.ts`**:

1. **HIGHEST IMPACT** for R0 score lift: prepend `"Ragazzi, "` directive to system prompt OR force first-token bias. The 10/10 plurale_ragazzi fail is the dominant gap.
2. Wire `getCapitoloByExperimentId(experimentId)` near line 234 of `unlim-chat/index.ts` BEFORE `buildSystemPrompt` call.
3. If lookup non-null, append `buildCapitoloPromptFragment(lookup.capitolo, experimentId)` to system prompt (keeps backward compat when capitolo missing).
4. Post-LLM: call `validatePrincipioZero(responseText, { isConceptIntro: scenario === 'introduce-concept' })`. If `severity === 'CRITICAL' || 'HIGH'`, log to `together_audit_log` (already exists per CLAUDE.md).
5. Do NOT reject response on violation (per ADR default in validator file: "append-warning pattern, no rejection on student runtime").
6. Re-run `node scripts/bench/run-sprint-r0-render.mjs` AFTER Edge Function deploy to measure delta vs 75.8% baseline. Target: ≥85%.

**Wire-up does NOT need new test files** — the 3 I wrote already provide regression guard for the shared helpers + the validator contract.

## Blockers / risks found

- None for tests. Implementation already on disk.
- `buildSystemPrompt` requires specific shape: `{completedExperiments, totalExperiments, commonMistakes, lastSession, level}`. If `unlim-chat/index.ts` passes a thinner object, it'll throw. Integration test asserts the full shape.
- Render endpoint shows "UNLIM" in responses (per CLAUDE.md confirmation). No name-confusion bug observed.
- Cold-start retry logic in runner already handles 503 + 30s back-off. First call was 27s, rest ≤16s.

## Re-run command for orchestrator (CoV)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
RENDER_UNLIM_URL="https://elab-galileo.onrender.com/chat" node scripts/bench/run-sprint-r0-render.mjs
npx vitest run tests/unit/buildCapitoloPromptFragment.test.js tests/unit/principioZeroValidator.test.js tests/integration/unlim-chat-prompt-v3.test.js
```
