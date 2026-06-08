# Cross-Fixture / Hardening — Multi-domain pipeline testing (M2-hardening)

Il LessonOS Core Engine deve funzionare su percorsi didattici di qualsiasi dominio, non solo il `sample_path` calculus. Questo file documenta la strategia di test multi-fixture.

## Fixture paths

### `fixtures/sample_path/` — Calculus (4 lezioni)

Domino: matematica — derivate e integrali. 4 lezioni (l1-l4). È il fixture primario per lo sviluppo della pipeline end-to-end.

- **path_id**: `path_calc_101`
- **sorgente**: `calculus_primer.txt`
- **Citazione**: `fixtures/sample_path/path.json:1-13` — manifest

### `fixtures/spaced_path/` — Learning Science (2 lezioni)

Domino: learning science — SM-2 e FSRS spaced repetition. 2 lezioni (l1 SM-2, l2 FSRS). Secondo fixture per hardening cross-dominio.

- **path_id**: `path_learning_101`
- **sorgente**: `learning_science_primer.txt`
- **Creato**: 2026-06-09 (iterazione M2-hardening, commit a1cba3e)
- **Mock payloads**: in `lessonos/pipeline.py` LESSON_MOCKS come `l1_sm2_intro` (3 concetti: spaced repetition, SM-2, fattore-di-facilita) + `l2_fsrs_advanced` (4 concetti: FSRS, stabilita-del-ricordo, funzione-di-ritenzione, ottimizzazione-cross-entropia)
- **Citazione**: `fixtures/spaced_path/path.json:1-13` — manifest; `fixtures/spaced_path/lessons/l1_sm2_intro.json:1-17` — lezione 1; `fixtures/spaced_path/lessons/l2_fsrs_advanced.json:1-22` — lezione 2

### `fixtures/bio_path/` — Biologia (2 lezioni)

Dominio: biologia — fotosintesi clorofilliana. 2 lezioni (l1 introduzione fotosintesi, l2 reazioni luce). Terzo fixture per hardening multi-dominio (biologia ≠ calculus ≠ learning science).

- **path_id**: `path_bio_101`
- **sorgente**: `fotosintesi_primer.txt`
- **Creato**: 2026-06-08 (iterazione P2, commit b79d922)
- **Mock payloads**: in `lessonos/pipeline.py` LESSON_MOCKS come `l1_fotosintesi_intro` (2 concetti: fotosintesi clorofilliana, cloroplasto) + `l2_reazioni_luce` (3 concetti: tilacoide, catena di trasporto elettronico, ciclo di Calvin)
- **Citazione**: `fixtures/bio_path/path.json:1-11` — manifest; `fixtures/bio_path/lessons/l1_fotosintesi_intro.json:1-18` — lezione 1; `fixtures/bio_path/lessons/l2_reazioni_luce.json:1-21` — lezione 2

## Regressione e multi-path

- `test_pipeline.py::test_mocks_cover_all_lessons` usa `issubset` (non `==`) per evitare di dover aggiornare il test ogni volta che si aggiungono mock per nuovi fixture path. **Citazione**: `tests/test_pipeline.py:233-241`
- `test_pipeline_spaced_path.py` verifica la pipeline su `spaced_path` con 13 test: 2 capsule, 7 concetti, 4 nuovi nel delta, 2 debiti, determinismo, idempotenza. **Citazione**: `tests/test_pipeline_spaced_path.py:1-201`

## Pattern per aggiungere un nuovo fixture path

1. Creare `fixtures/<nome_path>/path.json` (manifest con path_id, title, subject, lessons[], sources[])
2. Creare `fixtures/<nome_path>/lessons/<lesson_id>.json` (transcript + timeline_events per ogni lezione, schema §26.1)
3. Creare `fixtures/<nome_path>/sources/<source>.txt` (fonte testo, prima riga = titolo)
4. Aggiungere mock payload in `lessonos/pipeline.py` LESSON_MOCKS, con `seg_id` che risolvono a segmenti della fixture
5. Creare `tests/test_pipeline_<nome_path>.py` con test end-to-end (grounding via `store.get_segment()`)
