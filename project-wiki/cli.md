# CLI — `lessonos run-path` End-to-End Demo (M6-task1)

## Scopo

Il CLI `lessonos run-path` esegue l'intera pipeline LessonOS su un percorso fixture
e stampa output strutturato: Capsules → PathMemory → DidacticDelta → LearningDebt
→ NextLessonPlan. Dimostra il ciclo PLAN §3 ("ogni lezione rende più intelligente
la prossima") su dati sintetici con LLM mock (zero costi, deterministico).

## Modulo

**File**: `lessonos/cli.py`

Entry point configurato in `pyproject.toml`:
```
[project.scripts]
lessonos = "lessonos.cli:main"
```

**Citazione**: pyproject.toml:7-8 — entry point per `lessonos` CLI via `[project.scripts]`.

## Comandi

### `lessonos status [--db PATH]`

ZERO-LLM report strutturato del DB live: conteggio di paths, lezioni, segmenti,
nodi/archi/evidenze del grafo, insegnanti, e voci del cost-ledger.

Parametri:
- `--db PATH` — percorso al database SQLite (default: `:memory:` per fixture)

Output: report Markdown con breakdown per insegnante, avvisi su lezioni senza capsule.

**File**: `lessonos/status.py` (130 righe, ZERO-LLM, deterministica).
**Test**: `tests/test_status.py` — 11 test (empty, popolato, graph, capsule, ledger, CLI wiring).

### `lessonos run-path [--fixture PATH]`

Carica un percorso fixture, assembla capsule per ogni lezione (mock LLM),
calcola PathMemory → DidacticDelta → LearningDebt → NextLessonPlan.

Parametri:
- `--fixture PATH` — percorso al fixture directory (default: `fixtures/sample_path/`)

**Citazione**: lessonos/cli.py:340-350 — `run_path()`: pipeline completa a 7 fasi.

### `lessonos eval-real [--fixture PATH] [--lesson ID] [--n-runs N]`

Esegue `run_realtime_eval()` su una singola lezione mock e stampa le metriche
di quality (groundedness, excerpt-accuracy, costo). Mock di default (nessuna
chiamata API reale); per LIVE serve `DEEPSEEK_API_KEY` o `KIMI_API_KEY`.

Parametri:
- `--fixture PATH` — percorso al fixture directory (default: `fixtures/sample_path/`)
- `--lesson ID` — lezione da valutare (default: `l1_derivative_definition`)
- `--n-runs N` — numero di run per distribuzione (default: 1; usa >1 per `MultiRunEvalReport`)

**Citazione**: lessonos/cli.py:787-835 — handler `eval-real`: carica fixture, ingerisce
segmenti, costruisce mock router, chiama `run_realtime_eval()` o `run_realtime_eval_n_runs()`.

## Test Coverage

**File**: `tests/test_cli_eval_real.py` — 9 test.

1. `test_eval_real_default_lesson` — exit code 0 su lezione mock di default
2. `test_eval_real_output_contains_groundedness` — verifica groundedness= in output con parsing score
3. `test_eval_real_explicit_lesson` — `--lesson` esplicito funziona
4. `test_eval_real_n_runs_3` — distribuzione multi-run: output include `(3 runs)` e `run 1:`/`run 3:`
5. `test_eval_real_n_runs_1_default` — single run (default) non crasha
6. `test_eval_real_unknown_lesson_returns_1` — lezione inesistente → errore
7. `test_eval_real_missing_fixture_returns_1` — fixture mancante → errore
8. `test_eval_real_no_mock_lesson_returns_1` — lezione reale ma senza mock → errore
9. `test_eval_real_missing_path_json_returns_1` — path.json mancante → errore

**Citazione**: tests/test_cli_eval_real.py:1-158 — 9 test non-tautologici, copertura error path + output parsing.

## Architettura

### 1. Fasi della pipeline (`run_path()`, linee 340-455)

```
1. load_sample_path() → Path, persist Sources/Lessons
2. ingest_lesson_segments() + ingest_lesson_moments() per ogni lezione
3. assemble_lesson_capsule() per ogni lezione (con mock router)
4. build_path_memory() da tutte le capsule
5. compute_didactic_delta(old_memory, full_memory)
6. compute_learning_debt(full_memory, delta)
7. compute_next_lesson_plan(full_memory, delta, ledger)
```

**Citazione**: lessonos/cli.py:467-477 — `run_path()`: fasi 1-7 con print diagnostico.

### 2. Mock payloads deterministici

`_LESSON_MOCKS` (dict a livello di modulo) mappa ogni `lesson_id` a:
- `seg_payload` — risposta mock per `build_segmentation_prompt`
- `ext_payload` — risposta mock per `build_extraction_prompt`

Ogni seg_id e citation nei mock è validato contro le fixture reali dal test
`test_run_path_each_lesson_has_mock_fixture`.

**Citazione**: lessonos/cli.py:47-290 — `_LESSON_MOCKS` per l1/l2/l3/l4.

### 3. Router builder (`_build_router()`)

Costruisce il `MockProvider` al volo leggendo i segmenti già ingeriti dallo store,
costruendo i prompt deterministici e registrando le risposte mock.

**Citazione**: lessonos/cli.py:284-303 — `_build_router(store, lesson_id)`: legge
`store.segments_for_lesson()` e registra mock per seg_prompt + ext_prompt.

### 4. Formatting output

Helper privati `_capsule_summary()`, `_path_memory_summary()`, `_delta_summary()`,
`_debt_summary()`, `_plan_summary()` producono output leggibile con icone e
gerarchia visiva.

`_plan_summary()` ora accetta `memory` opzionale e, se disponibile, mostra
metriche FSRS per ogni review item e prerequisite gap:
- **`review day=N`** — giorno raccomandato per il ripasso (da `compute_scheduled_review_day`)
- **`D=N.N`** — difficoltà per-concept (solo se ≠ default 5.0)
- **`R=NN%`** — retention stimata (solo se disponibile)
- **`reps=N`** — conteggio ripetizioni (solo se > 1)

I valori di default (D=5.0, R=None, reps=1) sono nascosti per output più pulito.

**Citazione**: lessonos/cli.py:449-483 — `_plan_summary(plan, memory=...)` con `_fsrs_suffix()` helper.

## Esempio di output

```
LessonOS Core Engine — End-to-End Demo
========================================================================

  Path: Calcolo 1 — Derivate e Integrali (path_calc_101)
  Subject: matematica  |  Lessons: 4

  [1/5] Ingesting fixture segments and moments...
  Done: 4 lessons ingested.

  [2/5] Assembling Lesson Capsules (mock LLM)...
  ✓ l1_derivative_definition: 2 topics, 2 concepts, 2 exercises
  ✓ l2_derivative_rules: 3 topics, 3 concepts, 2 exercises
  ✓ l3_integral_intro: 3 topics, 3 concepts, 2 exercises
  ✓ l4_integral_substitution: 2 topics, 1 concept, 1 exercises

|--- Lesson Capsules ---
... (per-lezione)
|--- Path Memory ---
  State: growing  |  Lessons: 4  |  Concepts: 8  |  Exercises: 8
|--- Didactic Delta (L1+L2+L3 vs L1+L2+L3+L4) ---
  New concepts: 1 (sostituzione)
|--- Learning Debt Ledger ---
  Total items: 4
|--- Next Lesson Plan ---
  Total agenda items: 7 (varies)

Summary: 4 capsules, 8 concepts in Path Memory, 1 new concept in Delta,
4 debt items, 7 agenda items
```

## Test Coverage

**File**: `tests/test_cli.py` — 6 test.

1. `test_run_path_produces_all_four_capsules` — strutturato: verifica return dict
   con 4 capsule, 8 concetti in PathMemory, 1 nuovo delta (sostituzione da L4),
   "No mock registered" non appare (4/4 processate), "sostituzione" in output
2. `test_run_path_each_lesson_has_mock_fixture` — ogni mock seg_id e citation
   esiste nelle fixture reali, ogni status ∈ CONCEPT_STATUS (tutte e 4 lezioni,
   nessuna skip)
3. `test_run_path_delta_detects_new_l4_concepts` — delta_new == 1 (sostituzione)
4. `test_run_path_all_delta_fields_non_negative` — ricostruzione oggetti reali,
   tutti i counter ≥ 0
5. `test_run_path_empty_fixture_shows_error` — exit code 1 su fixture assente
6. `test_plan_summary_shows_fsrs_metrics_for_review_items` — unit test di
   `_plan_summary()` con `FakeMemory`: verifica rendering di review_day,
   difficulty D, retention R% e reps, edge case default nascosti (D=5.0,
   R=None, reps=1), review_day=0 visibile, empty plan non crasha

**Citazione**: tests/test_cli.py:1-6 — docstring: test non-tautologici, non solo string output.

## Design Rationale

1. **Mock deterministico** — l'intera demo gira con mock (zero costi, nessuna API key)
2. **Validazione mock vs fixture** — i test verificano che ogni seg_id citato nei mock
   esista nelle fixture reali (groundedness-by-construction del CLI stesso)
3. **Nessuna dipendenza nuova** — solo stdlib (argparse, json, pathlib, io)
4. **Return structurato** — `run_path()` ritorna dict con valori calcolati, testabile
   senza parsare stdout
5. **No FastAPI, no eval Kimi reale** — scope M6 condiviso in task piccole
