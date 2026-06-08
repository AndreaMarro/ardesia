# project-wiki/ — Change Log

Append-only. 1 riga per modifica.

- 2026-06-06T18:30:00Z — wiki seminata da stato M0-M2 (76 test green): schema.md, index.md, log.md, architecture.md, grounding.md, llm-router.md, data-model.md, store.md, capsule-pipeline.md creati
- 2026-06-07T16:00:00Z — wiki: cost tracking (LLMResponse.usage + estimate_kimi_cost) documentato in llm-router.md, citazioni file:line
- 2026-06-07T22:00:00Z — wiki: M2-task5 persistenza capsule (Store ABC save_capsule/get_capsule, SQLite tabella capsules SCHEMA_VERSION 4, assembly save=True/load_capsule) documentato in capsule-pipeline.md + store.md, citazioni file:line
- 2026-06-07T23:00:00Z — wiki: M3-task3 PathMemory (path-memory.md nuovo, index.md aggiornato): PathMemory dataclass + build_path_memory() in lessonos/graph/path_memory.py, 14 test, 136 passed
- 2026-06-07T23:30:00Z — wiki: M4-task1 DidacticDelta (didactic-delta.md nuovo, index.md aggiornato): compute_didactic_delta() in lessonos/graph/didactic_delta.py, 15 test, 151 passed. Review Claude Code: 2 fix.
- 2026-06-07T23:30:00Z — wiki: M4-task2 Learning Debt Ledger (learning-debt.md nuovo, index.md aggiornato): 5 categorie PLAN §3.4. 16 test, 167 passed. Review Claude Code: 2 fix.
- 2026-06-09(current) — wiki: Fix l4 SKIPPATA (Claude review batch #1): mock l4 registrato. 4 capsule, 246 passed.
- 2026-06-08T00:00:00Z — wiki: M4-task3 Next Lesson Planner (next-lesson-planner.md nuovo): 15 test, 182 passed.
- 2026-06-08T01:00:00Z — M4 FINALIZZATO.
- 2026-06-08T02:00:00Z — M5-task2 eval-metrics.md (nuovo): 9 test, 209 passed.
- 2026-06-07 — M5-task3 cost-ledger.md (nuovo): 21 test, 230 passed.
- 2026-06-08T03:00:00Z — M5-task1 eval set 10->20: M5 COMPLETO. 230 passed.
- 2026-06-08(current) — M6-task1 CLI (cli.md nuovo): 5 test, 235 passed.
- 2026-06-09(current) — M6-task2 FastAPI (api.md nuovo): 11 test, 246 passed. M6 COMPLETO.
- 2026-06-08 — P0 cross-iterazione observation: skill lessonos-observation. 254 passed.
- 2026-06-08 — P1 TaskPolicy router multi-provider: 267 passed.
- 2026-06-09 — RETRO #2: PROCESS-LOG.md aggiornato.
- 2026-06-08 — P1 eval LLM REALE: realtime-eval.md nuovo. 274 passed.
- 2026-06-09 — PipelineOrchestrator: pipeline.md nuovo. 300 passed.
- 2026-06-09 — SM-2 retrievability tracking: 300 passed.
- 2026-06-09 — Cross-fixture hardening: cross-fixture.md nuovo. 313 passed.
- 2026-06-09 — M3 Lesson Graph cross-lesson activation: lesson-graph.md nuovo. 361 passed.
- 2026-06-10 — M4 downstream prerequisite prioritisation: 367 passed.
- 2026-06-08 — RETRO #3 + lessonos-grounding-check skill: 367 passed.
- **2026-06-08 — FSRS power-law retention**: lessonos/graph/path_memory.py compute_retention cambiato da Ebbinghaus esponenziale (e^{-t/S}) a power-law (1/(1+t/S)), modellato su FSRS v4.5 / Reddy et al. 1602.07032. import math rimosso. Docstring con citazione reale. test_path_memory.py threshold aggiornato. test_next_lesson_planner.py commenti aggiornati. Review Claude Code: 1 fix (FSRS-5 falso rimosso). Gate VERDE 367 passed + 2 skipped (baseline 367 -> 367, no regressione).
|- **2026-06-08 — FSRS difficulty factor D per-concept stability**: lessonos/graph/path_memory.py ConceptPathEntry.difficulty (default 5.0, [1,10], __post_init__ validazione) + compute_retention accetta difficulty. Formula stability: `effective_mult = 1 + (multiplier - 1) * (11-D)/6` (crescita monotona garantita). Research: Ye 2023 FSRS v4. Review Claude Code: 1 bug fix (effective_mult < 1.0 per D>7). 10 test, 377 passed.
|- **2026-06-08 — FSRS difficulty update post-review**: lessonos/graph/path_memory.py compute_difficulty_update + ConceptPathEntry.update_after_review. Formula euristica SM-2 con pessimistic bias 3.3:1. 13 test nuovi. Review Claude Code: 5 fix (docstring, dead code->wiring, asimmetria, test sequenze). Gate 390 passed.
|- **2026-06-08 — M4 maturation: difficulty-aware severity in LearningDebt + NextLessonPlan**: lessonos/models/entities.py LearningDebtItem.severity (default 1.0), lessonos/graph/learning_debt.py _detect_unmastered severity=1.0+(D-5.0)/5.0 [0.2,2.0], lessonos/graph/next_lesson_planner.py _build_review_items severity tiebreaker. Review Claude Code: 3 fix. 5 test nuovi. Gate 398 passed.
|||- **2026-06-08 — apply_review_feedback (review hook)**: lessonos/graph/path_memory.py apply_review_feedback(memory, review_qualities) chiude il loop FSRS: D definito → aggiornato via feedback → usato per severity/prioritizzazione. Case-insensitive con normalizzazione centralizzata. 10 test (di cui 3 aggiunti su review bug: case-insensitive lookup, duplicati, case sconosciuto). lessonos/graph/__init__.py __all__. Review Claude Code: 1 bug critico (KeyError su case-mismatch lookup). Gate VERDE 408 passed + 2 skipped (baseline 398 → 408, +10, no regressione).
||- **2026-06-08 — pipeline review feedback hook**: lessonos/pipeline.py run_pipeline(review_feedback=...) hook opzionale dopo Phase 5. 6 test in test_pipeline.py. Review Claude Code: 3 fix. Gate VERDE 414 passed + 2 skipped (baseline 408 → 414, +6, no regressione, cost ~$0.003).
||- **2026-06-08 — RETRO #4**: 6 iterazioni dal RETRO #3 (367→414). Skill lessonos-grounding-check patchato: +3 sezioni (docstring/claim grounded, case-insensitive lookup, test `>=`→`==`) + +3 checklist items. PROCESS-LOG.md RETRO#4. Review Claude Code: 3 fix (claim non verificati, self-contradiction, bug già-fixato). Gate VERDE 414 passed + 2 skipped (baseline 414, no regressione, cost ~$0.004).\n|- **2026-06-08 — predict_stability (stability da review history)**: lessonos/graph/path_memory.py predict_stability(review_history, ...) nuova pure function FSRS-style: quality-weighted growth (q=5:100%, q=4:80%, q=3:50%, q<3: reset a initial_stability). Difficulty D modula crescita. Tests: tests/test_predict_stability.py (11 test). Export: lessonos/graph/__init__.py. Review Claude Code: 5 fix (bug semantico reset q<3, test bound rotto, naming _multiplicative_growth, test_single_zero_quality, test_poor_reviews_reset_stability). Consiglio: property-based testing (Hypothesis). Gate VERDE 445 passed + 2 skipped (baseline 434 → 445, +11, no regressione, cost ~$0.003).

- **2026-06-08(current) — P1 eval-reale LIVE completion**: extract_json parser (lessonos/capsule/parsing.py) tollera fence + prosa. DeepSeekProvider (lessonos/llm/deepseek.py) con error handling HTTP. run_realtime_eval ora prova DeepSeek prima di Kimi. LIVE eval su DeepSeek deepseek-chat: groundedness=1.00, excerpt=1.00, 4 concepts, $0.001713. docs/eval/first-real-report.md. Claude review: 4 fix. Gate 485 passed + 2 skipped (baseline 445 -> 485).
|- **2026-06-08(current) — P1 property-based tests (Hypothesis) for predict_stability invariants**: 9 property tests in tests/test_predict_stability_properties.py verificano invarianti formali (monotonicita', crescita, reset, boundedness, determinismo). **Bug reale trovato**: stability_multiplier < 1.0 causava stability DECRESCENTE su q>=3. Fix: validazione `>= 1.0` in predict_stability + compute_retention (lessonos/graph/path_memory.py:295-299,409-413). Claude review: 3 fix applicati. Gate 495 passed + 2 skipped (baseline 485 -> 495, +10).
