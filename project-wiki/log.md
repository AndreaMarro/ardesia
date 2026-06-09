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
- **2026-06-08 — recommended_review_day in NextLessonPlan**: _estimate_scheduled_review_day in inverte R=1/(1+t/S) per scheduling FSRS.
- **2026-06-08 — FSRS difficulty factor D per-concept stability**: lessonos/graph/path_memory.py ConceptPathEntry.difficulty (default 5.0, [1,10], __post_init__ validazione) + compute_retention accetta difficulty.
- **2026-06-08 — FSRS difficulty update post-review**: lessonos/graph/path_memory.py compute_difficulty_update + ConceptPathEntry.update_after_review.
- **2026-06-08 — M4 maturation: difficulty-aware severity in LearningDebt + NextLessonPlan**: LessonPlan.
- **2026-06-08 — apply_review_feedback (review hook)**: lessonos/graph/path_memory.py apply_review_feedback chiude il loop FSRS.
- **2026-06-08 — pipeline review feedback hook**: lessonos/pipeline.py run_pipeline(review_feedback=...) hook opzionale.
- **2026-06-08 — RETRO #4 + skill lessonos-grounding-check patch**: 414 passed.
- **2026-06-08 — predict_stability (stability da review history)**: lessonos/graph/path_memory.py predict_stability, 445 passed.
- **2026-06-08 — compute_scheduled_review_day**: 535 passed.
- **2026-06-08(current) — P1 eval-reale LIVE completion**: extract_json parser + DeepSeekProvider. 485 passed.
- **2026-06-08(current) — P1 property-based tests (Hypothesis) for predict_stability**: 495 passed.
- **2026-06-08(current) — P2: terza fixture bio_path (fotosintesi)**: 508 passed.
- **2026-06-08(current) — P1 TaskPolicy tests + bugfixes**: 557 passed.
- **2026-06-08(current) — P1 CostLedger multi-provider pricing routing**: 560 passed.
- **2026-06-08(current) — CLI FSRS metrics exposure**: 561 passed.
- **2026-06-08(current) — RETRO #6**: 561 passed.
- **2026-06-08(current) — P2 cross-fixture FTS integration tests**: 600 passed.
- **2026-06-09(current) — P2 CLI observations subcommand**: 608 passed.
- **2026-06-09(current) — fix: floating-point precision in test_stability_bounded property test**: 600 passed.
- **2026-06-09(current) — M7 P0: raw ingestion chunker + fixture PLACEHOLDER**: 660 passed.
- **2026-06-09(current) — M7 P1: eval su raw**: 678 passed.
- **2026-06-10(current) — P2: test DeepSeekProvider.complete() with mocked HTTP**: 687 passed.
- **2026-06-10(current) — P2: optimal_desired_retention(D, rep_count)**: 704 passed.
- 2026-06-10(current) — FM2 timeout+retry: lessonos/llm/_retry.py. 739 passed.
||- **2026-06-10(current) — Fix test_search_observations fragility (gate ripristino 776 pass)**: test query "add" matchava commit SHA → fix a "add-". Review Claude: regressione copertura rilevata. observation aggiornata con commit reale. Gate VERDE 776 pass.
|||- **2026-06-10(current) — P2 CLI eval-real subcommand**: lessonos eval-real [--fixture PATH] [--lesson ID] [--n-runs N] per eval mock on-demand. 9 test, 785 passed.
||- **2026-06-10(current) — P2 log_iteration helper**: one-shot dual-write observation+log.jsonl. 792 passed.
|||- **2026-06-08(current) — RETRO #7**: 15 iterazioni da RETRO #6 (561→792 test, +231, no regressione). Attriti: log_iteration creato, skill non caricato automaticamente, collision SHA/hex (2x), Claude auth-loop cronico. PROCESS-LOG.md aggiornato. 792 passed.
|||- **2026-06-08(current) — P0a Course Foundry (COORDINATION.md pivot)**: lessonos/course/ (schema.py + folder_loader.py) + fixtures/sample_course/ (3 lezioni ordinate, 3 sorgenti, 3 moduli). 40 test, 832 passed. Review Claude: 1 bug (module lesson_ids non validati).
|||- **2026-06-08(current) — P0b ContentAtom + capsule_to_atoms converter (COORDINATION.md ordine #2)**: lessonos/course/atoms.py (ContentAtom frozen, ATOM_TYPES 13 vocab, capsule_to_atoms). 43 test, 875 passed. Review Claude: 1 bug critico (atom_id contatore unico per tutti i tipi -> fix contatori separati).
|||- **2026-06-09(current) — P0c CourseBlueprint builder with content_atom_ids (COORDINATION.md ordine #3)**: lessonos/course/blueprint.py + ModuleBlueprint.content_atom_ids field. build_course_blueprint(course, atoms, audience, level) backward-compatible + atom assignment. 13 test, 894 passed. Review Claude: auth-loop timeout (self-review OK).
||- **2026-06-09(current) — P1 Markdown Course Exporter (COORDINATION.md ordine #4)**: lessonos/export/markdown_course.py. export_course_markdown(blueprint, atoms, output_dir, include_ai_atoms) -> course.md + modules/ + exercises.md + quiz.md. 38 test, 932 passed. Review Claude: seg_id test-only grounding fix (test-seg-1). ZERO-LLM, stdlib only.
||- **2026-06-09(current) — P1 LiaScript Course Exporter (COORDINATION.md ordine #5)**: lessonos/export/liascript.py + tests/test_export_liascript.py. export_liascript(blueprint, atoms) -> single .md con quiz interattivi LiaScript. 20 test, 952 passed. Review Claude: 3 bug (backslash, seg_id inventati, dead code). ZERO-LLM.
|||- **2026-06-10(current) — P1 Quarto Course Exporter**: lessonos/export/quarto.py + tests/test_export_quarto.py. export_quarto(blueprint, atoms) -> _quarto.yml + index.qmd + modules/*.qmd + exercises.qmd + quiz.qmd. 46 test, 998 passed. Review Claude: 1 fix (seg_id test-s1 -> l1s1). ZERO-LLM, stdlib only.
||||- **2026-06-10(current) — P1 Moodle XML Quiz Exporter**: lessonos/export/moodle_xml.py + tests/test_export_moodle_xml.py. export_moodle_xml(blueprint, atoms) -> quiz.xml standard Moodle. multichoice/shortanswer/essay/categories. 16 test, 1014 passed. Review Claude (2 iter): 7 fix totali (seg_id, coverage, validazione, naming). ZERO-LLM, stdlib-only.
||- **2026-06-10(current+2) — P1 CLI compile-course command (COORDINATION.md §18)**: lessonos/cli.py _parse_args compile-course subparser + handler. lessonos compile-course <folder> --target markdown|liascript|quarto. 15 test, 1029 passed. Review Claude: 1 fix (>= 2 -> == 4 su conteggio file deterministico). ZERO-LLM, zero deps.
||- **2026-06-10(current+3) — P1 Source Material Extractor (Docling-adapter foundation)**: lessonos/export/source_extractor.py + tests/test_source_extractor.py. extract_source_materials(course) -> SourceMaterialPack: legge sources/ globali + lessons/ per-lezione. SourceMaterial frozen. 24 test, 1053 passed. Review Claude: 1 bug (>= 3 -> == 6), 1 code smell (branch duplicato). ZERO-LLM, stdlib-only.
|docling-adapter.md — 2026-06-11(current+4) — P1 Docling-adapter: PDF/DOCX/HTML/VTT/SRT extraction via subprocess+stdlib (ZERO new deps). lessonos/export/docling_adapter.py + tests/test_docling_adapter.py. docling_extract dispatcher + 5 estrattori. Integrato in source_extractor.py. 25 test, 1078 passed (+25). Review Claude: 3 fix (mock deterministico, import rimosso, messaggi errore differenziati).
||- **2026-06-11(current+5) — P1 LLM-planner stub**: planner.py — plan_course() + PlannerResult/PlannerMaterial frozen. 21 test. CLI wiring. Review: 1 false positive (quick-diff limit). Gate 1099 (+21).
|||- **2026-06-11(current+6) — P1 Teacher-review stub**: teacher_review.py — TeacherReviewNote, ReviewAction/ReviewScope enums, TeacherReviewSet, make_review_note(), is_course_approved(). 50 test. Gate 1149 (+50, no regression). COORDINATION.md roadmap completato.
|||- **2026-06-11(current+7) — P1 teacher-review CLI integration**: --review (print status + review.json), --approve (auto-approve). Compile-course 22 test, gate 1156 (+7).
