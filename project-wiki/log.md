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
- **2026-06-10(current) — Fix test_search_observations fragility (gate ripristino 776 pass)**: test query "add" matchava commit SHA → fix a "add-". Review Claude: regressione copertura rilevata. observation aggiornata con commit reale. Gate VERDE 776 pass.
- **2026-06-10(current) — P2 CLI eval-real subcommand**: lessonos eval-real [--fixture PATH] [--lesson ID] [--n-runs N] per eval mock on-demand. 9 test, 785 passed.
- **2026-06-10(current) — P2 log_iteration helper**: one-shot dual-write observation+log.jsonl. 792 passed.
- **2026-06-08(current) — RETRO #7**: 15 iterazioni da RETRO #6 (561→792 test, +231, no regressione). Attriti: log_iteration creato, skill non caricato automaticamente, collision SHA/hex (2x), Claude auth-loop cronico. PROCESS-LOG.md aggiornato. 792 passed.
- **2026-06-08(current) — P0a Course Foundry (COORDINATION.md pivot)**: lessonos/course/ (schema.py + folder_loader.py) + fixtures/sample_course/ (3 lezioni ordinate, 3 sorgenti, 3 moduli). 40 test, 832 passed. Review Claude: 1 bug (module lesson_ids non validati).
- **2026-06-08(current) — P0b ContentAtom + capsule_to_atoms converter (COORDINATION.md ordine #2)**: lessonos/course/atoms.py (ContentAtom frozen, ATOM_TYPES 13 vocab, capsule_to_atoms). 43 test, 875 passed. Review Claude: 1 bug critico (atom_id contatore unico per tutti i tipi -> fix contatori separati).
- **2026-06-09(current) — P0c CourseBlueprint builder with content_atom_ids (COORDINATION.md ordine #3)**: lessonos/course/blueprint.py + ModuleBlueprint.content_atom_ids field. build_course_blueprint(course, atoms, audience, level) backward-compatible + atom assignment. 13 test, 894 passed. Review Claude: auth-loop timeout (self-review OK).
- **2026-06-09(current) — P1 Markdown Course Exporter (COORDINATION.md ordine #4)**: lessonos/export/markdown_course.py. export_course_markdown(blueprint, atoms, output_dir, include_ai_atoms) -> course.md + modules/ + exercises.md + quiz.md. 38 test, 932 passed. Review Claude: seg_id test-only grounding fix (test-seg-1). ZERO-LLM, stdlib only.
- **2026-06-09(current) — P1 LiaScript Course Exporter (COORDINATION.md ordine #5)**: lessonos/export/liascript.py + tests/test_export_liascript.py. export_liascript(blueprint, atoms) -> single .md con quiz interattivi LiaScript. 20 test, 952 passed. Review Claude: 3 bug (backslash, seg_id inventati, dead code). ZERO-LLM.
- **2026-06-10(current) — P1 Quarto Course Exporter**: lessonos/export/quarto.py + tests/test_export_quarto.py. export_quarto(blueprint, atoms) -> _quarto.yml + index.qmd + modules/*.qmd + exercises.qmd + quiz.qmd. 46 test, 998 passed. Review Claude: 1 fix (seg_id test-s1 -> l1s1). ZERO-LLM, stdlib only.
- **2026-06-10(current) — P1 Moodle XML Quiz Exporter**: lessonos/export/moodle_xml.py + tests/test_export_moodle_xml.py. export_moodle_xml(blueprint, atoms) -> quiz.xml standard Moodle. multichoice/shortanswer/essay/categories. 16 test, 1014 passed. Review Claude (2 iter): 7 fix totali (seg_id, coverage, validazione, naming). ZERO-LLM, stdlib-only.
- **2026-06-10(current+2) — P1 CLI compile-course command (COORDINATION.md §18)**: lessonos/cli.py _parse_args compile-course subparser + handler. lessonos compile-course <folder> --target markdown|liascript|quarto. 15 test, 1029 passed. Review Claude: 1 fix (>= 2 -> == 4 su conteggio file deterministico). ZERO-LLM, zero deps.
- **2026-06-10(current+3) — P1 Source Material Extractor (Docling-adapter foundation)**: lessonos/export/source_extractor.py + tests/test_source_extractor.py. extract_source_materials(course) -> SourceMaterialPack: legge sources/ globali + lessons/ per-lezione. SourceMaterial frozen. 24 test, 1053 passed. Review Claude: 1 bug (>= 3 -> == 6), 1 code smell (branch duplicato). ZERO-LLM, stdlib-only.
- docling-adapter.md — 2026-06-11(current+4) — P1 Docling-adapter: PDF/DOCX/HTML/VTT/SRT extraction via subprocess+stdlib (ZERO new deps). lessonos/export/docling_adapter.py + tests/test_docling_adapter.py. docling_extract dispatcher + 5 estrattori. Integrato in source_extractor.py. 25 test, 1078 passed (+25). Review Claude: 3 fix (mock deterministico, import rimosso, messaggi errore differenziati).
- **2026-06-11(current+5) — P1 LLM-planner stub**: planner.py — plan_course() + PlannerResult/PlannerMaterial frozen. 21 test. CLI wiring. Review: 1 false positive (quick-diff limit). Gate 1099 (+21).
- **2026-06-11(current+6) — P1 Teacher-review stub**: teacher_review.py — TeacherReviewNote, ReviewAction/ReviewScope enums, TeacherReviewSet, make_review_note(), is_course_approved(). 50 test. Gate 1149 (+50, no regression). COORDINATION.md roadmap completato.
- **2026-06-11(current+7) — P1 teacher-review CLI integration**: --review (print status + review.json), --approve (auto-approve). Compile-course 22 test, gate 1156 (+7).
|- **2026-06-11(current+8) — P2 Quarto Slides (revealjs) exporter**: export_quarto_slides() + QuartoSlidesPack + _build_quarto_slides_yml. CLI wiring --target quarto-slides. 23 test, gate 1215 (+27).
|||- **2026-06-12(current+10) — P2: --target all per compile-course**: lessonos compile-course --target all esegue 5 esportatori in sequenza. target='all' scelta valida. --output /custom + all scrive /custom/<target>/. --review/--approve solo sul primo target. 3 nuovi test. Review Claude: 4 bug fix. Gate 1226 (+3).

- **2026-06-15(current+13) — P1: GeneratedArtifact lineage tracking**: lessonos/course/lineage.py — GeneratedArtifact, SourceLink, build_{markdown,liascript,quarto,slides}_pack.artifact. REGOLA LINEAGE COORDINATION.md. 421 test. Gate 1266 (+40).

|- **2026-06-15(current+14) — RETRO #9**: 8 iterazioni da RETRO #8 (1156→1266 test, +110, no regression). Attriti chiusi: grounding seg_id (3x), test >= deterministici (3x). Aperti: observations saltate (2x), excerpt non grounded in lineage (2x). check-frictions.sh: 0 warning.
|- **2026-06-16(current+15) — P2 Cross-fixture grounding audit**: tests/test_pipeline_cross_fixture_grounding.py — 6 test che esegue run_pipeline su ogni fixture path (3) e verifica grounding su TUTTE le citazioni (seg_id risolve, excerpt in text). Claude review: 4 fix. Gate 1272 (+6). project-wiki/cross-fixture-grounding-audit.md nuovo.
|||- **2026-06-16(current+16) — P1: plan_course() accepts atoms_per_lesson**: planner.py atoms_per_lesson parameter → forward a build_course_blueprint() → content_atom_ids nei moduli. Gap Course Foundry chiuso: CourseFolder → plan_course(atoms=...) → blueprint con atom_ids. ZERO-LLM, deterministico. 3 test, gate 1275 (+3). project-wiki/llm-planner-stub.md update.
||- **2026-06-09(current+17) — P2: FM4 defensive mode hardened per tutti e 4 gli item types**: tests/test_capsule_assembly.py — test parametrizzato (4 casi) che verifica defensive=True droppa citation fabbricata per concept/exercise/student_question/homework. Claude Code review: guardia isinstance su dropped substring check. Gate 1279 (+4). project-wiki/capsule-pipeline.md update (sezione 6 Defensive Mode).
||- **2026-06-16(current+18) — M7: Didactic Delta maturation — difficulty-weighted severity**: DeltaConceptChange.difficulty + severity, DidacticDelta.severity_weighted_avg + severity_max, helper _difficulty_to_factor/_compute_severity/_build_difficulty_map. 7 nuovi test (23 totali, +7). Claude review: 4 fix. Gate 1286 (+7). project-wiki/didactic-delta.md update.
||- **2026-06-16(current+19) M8-task1: CLI eval-real --live + multi-run DeepSeek LIVE + FM6/FM7 fix**: lessonos/eval/realtime.py + lessonos/capsule/extraction.py + lessonos/cli.py. --live / --model flag per eval-real. FM6: tuple(c.get(prerequisites) or []) LLM prerequisites null non crasha piu. FM7: defensive=True in assemble call live. Risultati LIVE: groundedness=1.00, excerpt=1.00 su 9/9 runs (3 lezioni x 3 runs), costo ~$0.00017/run. docs/eval/real-transcript-report.md aggiornato con distribuzione. 2 nuovi test parser. Gate 1288 (+2).
||- **2026-06-16(current+20) M8-task2: Cross-domain eval-real mock (spaced_path + bio_path)**: 4 nuovi mock in LESSON_MOCKS (lessonos/cli.py:320-587): spaced_path l1_sm2_intro + l2_fsrs_advanced, bio_path l1_fotosintesi_intro + l2_reazioni_luce. Ciascun mock usa seg_id reali dalle fixture. 6 nuovi test (tests/test_cli_eval_real.py:218-274). Claude Code review: 6 fix su excerpt non verbatim. Gate 1294 (+6). project-wiki/realtime-eval.md aggiornato (sezione Cross-domain mock).
|||- **2026-06-16(current+21) M8-task3: Cross-domain live eval (spaced_path + bio_path, DeepSeek LIVE)**: confermata robustezza cross-dominio con LLM reale su 4 lezioni da 3 domini. groundedness=1.00, excerpt=1.00 su 4/4. Costo ~$0.00136. Gateway M8 chiuso: mock + live su tutti e 3 i domini. Solo doc changes, gate 1294 invariato (+0). project-wiki/realtime-eval.md aggiornato (sezione Cross-domain LIVE results).
|- **2026-06-10(current+22) — M0 T4a-step1: ASR module + faster-whisper infrastructure + Prima lezione transcription pilot**: lessonos/asr/ (convert.py, transcribe.py, pipeline.py, models.py) + 28 tests mock. uv add faster-whisper. Claude Code review: 5 fix applicati (confidence domain, kwargs assertions, ffmpeg cleanup, narrow except, find_ffmpeg monkeypatch). Gate: 1322 passed (+28). WF cache: large-v3-turbo ~1.6GB. Transcription running on Prima lezione (71min audio, language=it detected 99%). project-wiki/asr.md nuovo.
|- **2026-06-10(current+23) — M0 T4a-step2: REAL transcription of Prima lezione (verified, honest spot-check)**: faster-whisper large-v3-turbo int8 CPU su 71min audio reale. Chiamata diretta transcribe_with_fallback(language='it') come da correzione Claude PLAN-CHECK. Output: Prima_lezione_teoria_dei_segnali.speech.segment.jsonl - 1351 segmenti, timestamps 0.0s-4254.48s (70.9min), tutti monotoni. Contenuto verificato: 'segnal' 167 hit, 'energia/potenza' 13, 'rettangolo' 4. Confidenza media 0.73, 23/1351 (1.7%) <0.3. Termini 'sinc'/'triangolo' non rilevati (dichiarato onestamente). bin/verify-transcription.sh creato; 3 bug fixati da Claude review opus-4-8 (no bc dep, guardie file corti, verdetto multi-aspetto). Gate 1322 invariato. project-wiki/asr.md aggiornato (sezione Real transcription results + Honest limitations).
||- **2026-06-10(current+24) — M0 T4a-step3: REAL transcription of Seconda lezione (verified, honest spot-check)**: faster-whisper large-v3-turbo int8 CPU su 83min audio reale. transcribe_with_fallback(language='it'). Output: Seconda_lezione_teoria_dei_segnali.speech.segment.jsonl — 3446 segmenti, 328KB, timestamps 0.0s-4980.1s (83.0min), tutti monotoni. Contenuto: 'segnal' 90 hit, 'seno/coseno/sin' 132, 'energia/potenza' 29/31, 'continuo/a' 45, 'sinc' 3. Confidenza media 0.7341, 5/3446 (0.1%) <0.3. Problemi: 'ampiezza' sistematicamente 'ambienza' (8 seg/10 occ), frammentazione alta (41 seg/min vs Prima 19). PLAN-CHECK opus-4-8 approvato. Gate 1322 invariato. project-wiki/asr.md aggiornato (sezione Seconda lezione results).
||- **2026-06-10(current+25) — T4-fix: 3 CRITICI ASR fixati (COORDINATION.md §17)**: (1) verify-transcription.sh via sys.argv[1] (no shell injection); (2) run_asr_pipeline salta ffmpeg conversion per input .wav (double-conversion fix VERO); (3) segments_from_jsonl try/except + logger.warning. 6 nuovi test, gate 1328 (+6). project-wiki/asr.md aggiornato (Overview T4-fix banner).- 2026-06-10T08:20 — T4a-step3 completato: Quarta lezione trascritta (2883 seg, 97.2 min, conf 0.68). T4a-step3 finito: 4/4 lezioni reali di Teoria dei Segnali trascritte con large-v3-turbo int8 CPU. Gate 1328+2 invariato. Next: T4b (ingest->capsule su lezione 1) o come da ordine COORDINATION.

- **2026-06-10(current+26) — T5 graph_writer: Capsule->SQLite graph tables (nodes/edges/evidence, SCHEMA_VERSION 6)**: lessonos/graph/writer.py (GraphWriter 139 righe), SQLiteStore 8 nuovi metodi (base.py:93-123, sqlite.py:18+70-93+340-445), GraphEvidence entities.py:160-173. Grounding validation: seg_id risolto, excerpt verbatim. 14 test, gate 1351 (+14).
