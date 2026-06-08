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
- **2026-06-08 — FSRS difficulty factor D per-concept stability**: lessonos/graph/path_memory.py ConceptPathEntry.difficulty (default 5.0, [1,10], __post_init__ validazione) + compute_retention accetta difficulty. Formula stability: `effective_mult = 1 + (multiplier - 1) * (11-D)/6` (crescita monotona garantita). Research: Ye 2023 FSRS v4. Review Claude Code: 1 bug fix (effective_mult < 1.0 per D>7). 10 test, 377 passed.
