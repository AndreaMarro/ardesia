# project-wiki/ — Index

Ogni pagina + riassunto 1 riga.

## Meta

- **schema.md** — convenzioni wiki: 1 concetto/pagina, citazioni verificate, index+log, codice-vince-su-doc
- **log.md** — storia append-only delle modifiche wiki

## Architettura e Principi

- **architecture.md** — decisioni architetturali fondamentali (Python, SQLite, router multi-LLM, JSON strutturati)
- **grounding.md** — invariante anti-allucinazione: citazioni validate, ValueError su seg_id fabbricato

## Sistemi Core

- **llm-router.md** — router astratto + provider mock (deterministico) + kimi (Moonshot eval-gated)
- **data-model.md** — 9 entità domain + vincoli vocab (EDGE_TYPES, CONCEPT_STATUS) validati a costruzione
- **store.md** — layer persistenza astratto (Store ABC) + SQLiteStore relazionale
- **capsule-pipeline.md** — pipeline estrazione Lesson Capsule: ingest → segmentation → extraction
- **path-memory.md** — Path Memory: aggregazione path-level da capsules (M3-task3)
- **didactic-delta.md** — Didactic Delta: diff tra versioni PathMemory (M4-task1, PLAN §3.3)
- **learning-debt.md** — Learning Debt Ledger: 5 categorie di debito didattico da PathMemory + Delta (M4-task2, PLAN §3.4)
- **next-lesson-planner.md** — Next Lesson Plan: agenda prioritizzata per la prossima lezione da PathMemory + Delta + Debt (M4-task3, PLAN §8.2)
- **eval-metrics.md** — EvalMetrics: groundedness + citation-excerpt-accuracy metric factories (M5-task2, PLAN §22)
- **realtime-eval.md** — P1 eval LLM reale: run_realtime_eval con Kimi su fixture, misura qualità + costo
- **observation.md** — Observation Store: cross-iterazione structured memory file-based JSONL (poiché Hermes memory disabilitato + agentmemory :3111 non HTTP-reachable)
- **cost-ledger.md** — Cost Ledger: per-LLM-call cost tracker (M5-task3, PLAN §20)
- **llm-retry.md** — Shared retry helper for LLM provider HTTP calls (FM2 timeout+retry, lessonos/llm/_retry.py)
- **pipeline.md** — PipelineOrchestrator: run_pipeline() + PipelineResult (P2 product-API, lessonos/pipeline.py)
- **cli.md** — CLI lessonos run-path end-to-end (M6-task1, PLAN §8.2) + `lessonos observations` subcommand
- **cross-fixture.md** — Multi-fixture hardening: second fixture path spaced_path (SM-2/FSRS), pattern per aggiungere nuovi fixture path
- **retrieval-fts-cross-fixture.md** — Cross-fixture FTS integration tests: 3 domains (calculus, spaced repetition, biology), 21 test, rebuild consistency, domain isolation
- **lesson-graph.md** — Lesson Graph: build_lesson_graph (per-lesson), build_path_graph (cross-lesson repeats/depends_on), graph queries (where_introduced, prerequisites_of, topological_concepts)
- **raw-ingestion.md** — Raw text/VTT/SRT → Segments: rule-based chunker M7 P0 (ZERO-LLM)
- **raw-eval.md** — Raw-transcript eval: pipeline end-to-end su raw text con failure modes (M7 P1)

## Course Foundry (nuovo)

|- **course-foundry.md** — P0a: CourseFolder schema + folder_loader + fixture sample_course (3 lezioni, ZERO-LLM, NO UI)
|- **markdown-export.md** — P1: Markdown Course Exporter: CourseBlueprint + ContentAtoms → course.md + modules + exercises.md + quiz.md (ZERO-LLM)
