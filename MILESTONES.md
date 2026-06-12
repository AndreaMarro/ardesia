# LessonOS Core Engine — Roadmap bounded (stato REALE dopo M1)

> Regola: una task alla volta (AGENTS.md §3). Ogni milestone = poche task piccole.
> MILESTONES aggiornata al 2026-06-12 per riflettere il lavoro REALE dopo il pivot M0→M1 (giugno 2026).
> Questo file NON è più la roadmap originale M0-M6 (vedi COORDINATION-ARCHIVE.md per lo storico).

## M0 — Filone Verticale (completato, gate 1434/0)
- [x] T4a: ASR pilot su 4 audio reali (faster-whisper large-v3-turbo, 4/4 trascritte)
- [x] T4b: Adapter ASR → Segment + capsule DeepSeek LIVE su Prima lezione ($0.00056)
- [x] T5: GraphWriter (Capsule→SQLite nodes/edges/evidence, ZERO LLM, 14 test)
- [x] T5-FIX: Cross-lesson grounding guard + transaction atomicity (2 CRITICI fixati)
- [x] T6: Summarizer + grounding helper + LIVE run su Prima lezione (17 test)
- [x] T6-COMPLETAMENTO: Capsule 2-4 assemblate + summaries 2-4 + DB persistente
- [x] T6R: Off-by-one fix, full-lesson batching, guardrail anti-falso-verde
- [x] T7: SCHEMA.md (contratti seg_id, grounding, GDPR, raw/derived, SCHEMA_VERSION)
- [x] T8: ingest-bundle (.lesson → segmenti da testo lavagna → pipeline)
- [x] M0 certified: gate 1434/0, HERMES-2 0-critici, deepreview blocker 0

## M1 — Personalizzazione per-docente (completato, gate 1608/0)

### M1-1: Grafo per-docente (gate +13 da M0)
- [x] `teacher_id` su Path, `aggregate_teacher_graph()` con dedup canonical
- [x] 96 concetti unici, 130 edges, 328 evidence su 4 lezioni Teoria-Segnali reali
- [x] Cross-teacher guard: docenti diversi non contaminano + backward compat

### M1-2a: TeacherBook Builder (ZERO-LLM, gate +11)
- [x] `build_teacher_book(store, teacher_id)`: 5 sezioni (overview, fundamental, problematic, progression, prerequisites)
- [x] Nuove entità frozen: TeacherConcept, ConceptProgression, PrerequisiteChain, TeacherBook

### M1-3: TeacherBook per-stile + renderer (ZERO-LLM, gate +13)
- [x] `render_teacher_book()` + `render_comparative_report()`: 10/10 docenti sim Fisica1 generati
- [x] `render_qualitative_diff()`: diff stilistico pratico vs socratico vs rigoroso
- [x] Adversarial CRITICO+MAGGIORI fixati (M1-3-FIX + M1-3b)

### M1-4: Dispensa stilizzata (gate +33 da M1-3)
- [x] `lessonos/style.py`: StyleProfile ZERO-LLM (exercise_density, question_density, prereq_explicitness, concept_granularity, registro, tics)
- [x] `lessonos/dispensa.py`: Pipeline LLM-guided con gate fail-closed, verify_dispensa
- [x] Test stile divergente: stesso capsule, stili opposti → markdown diverso strutturalmente
- [x] M1-4b: Fix matching (edit-distance), dropped_texts preserva, empty-claims gate
- [x] M1-4c: 5 bug-hunt test cementati (stale evidence, gate-before-save, bundle purge, second-lesson aggregate, repair adversarial)

### M1-5: Motore (gate +28 da M1-4)
- [x] purge_lesson transazionale + erase_lesson (wiki + DB, 7 test reali SQLiteStore)
- [x] _lesson_ids_from_path fonte primaria (deprecato lesson_ids JSON → derived)
- [x] Negation-aware repair con word-boundary guard (non⊄nonostante, no⊄sono)
- [x] pipeline.run_ingest consolidato + retro-review (defense-in-depth documentata, non bug)
- [x] H2-1327 determinism test

### M1-6 Fase F: Dispense LIVE + ground-truth (gate invariato, dati reali)
- [x] Andrea dispensa LIVE: 23/23 verified, 0 dropped (deepseek-chat, 10 sezioni narrative)
- [x] 3 sim verify: prof_pratico 51/51, prof_socratico 32/32, prof_rigoroso 27/27
- [x] GROUND-TRUTH vs dispense VERE (Energia.pdf, Sommabilità.pdf): 0 contraddizioni, gap copertura dichiarato
- [x] BLIND-TEST-ANDREA.md: 10 paragrafi pronti per giudizio (>=7/10 = accettazione)

### M1-7: Vault-export Obsidian (gate +25 da M1-6)
- [x] `lessonos/export/obsidian_vault.py`: export_vault() + helpers (slug, wikilink, frontmatter, canvas)
- [x] CLI `lessonos export-vault --teacher andrea --out derived/vault/andrea/ [--canvas]`
- [x] 96 concept pages (frontmatter YAML + evidence citations + ^seg wikilinks)
- [x] 4 trascrizioni lezione con ^seg block anchor citabili da Obsidian
- [x] wiki/dispense/teacher_book copiati con wikilink-ificazione exact-match
- [x] JSON Canvas 1.0 opzionale (grafo prerequisiti)
- [x] README anti-edit nel vault
- [x] ZERO LLM, ZERO modifiche al motore
- [x] 25 test: smoke, idempotenza byte-per-byte, frontmatter, evidence, wikilink, canvas

## M2 — In attesa di pin da CLAUDE-SAYS

**M1 COMPLETO (M1-1→M1-7, gate 1656/0).** Prossimi candidati M2 (non pinnati, ordine da decidere):
- [x] M2-3: Badge per-claim nel rendering ✅ (commit 1e7c18f, gate 1656/0, roadmap R1)
- [x] **M2-2: StyleProfile v2 dallo stile SCRITTO ✅ (commit CURRENT, gate 1685/0)** — WrittenStyleProfile + 6 metric functions ZERO-LLM derivate dal corpus dispense VERE di Andrea (9 PDFs via pdftotext). Prompt dispensa usa ENTRAMBI i profili (parlato v1 + scritto v2). 28 nuovi test.
- M2-1: Giudizio blind-test M1-6 (>=7/10?)

**Regola attuale: Hermes non costruisce fuori dai pin.** Attende nuovi ordini in COORDINATION.md § CLAUDE-SAYS.

**Karpathy**: Una modifica/ipotesi per iterazione. Gate frozen = autorità. Onestà sopra velocità.
