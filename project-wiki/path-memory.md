# Path Memory — Aggregazione Path-Level (PLAN §26.2)

Path Memory è l'aggregazione progressiva di tutti i Lesson Capsules di un percorso.
Costruita da `build_path_memory()` in `lessonos/graph/path_memory.py`.

## Modulo

**File**: `lessonos/graph/path_memory.py`

### _collect_misconceptions(capsules) -> tuple[str, ...]

Raccoglie tutte le `student_questions` come misconception testuali.

**Citazione**: `lessonos/graph/path_memory.py:292-305`.

### compute_difficulty_update(difficulty, response_quality) -> float

Aggiorna il fattore di difficolta D dopo una risposta dello studente (post-review).
Formula SM-2 euristica con pessimistic bias 3.3:1 (penalizza errore piu del premio).

**Citazione**: `lessonos/graph/path_memory.py:159-258` — `compute_difficulty_update()`:
q>=4 (corretto) → D' = D - (q-3)*0.3; q=3 (hard) → D' = D + 0.1;
q<=2 (errato) → D' = D + (4-q)*0.5. Clamp in [1.0, 10.0].

Esportato da `lessonos/graph/__init__.py`.

## Entità

### PathMemory (frozen dataclass)

Aggregazione path-level completa (PLAN §26.2).

**Citazione**: `lessonos/graph/path_memory.py:247-266` — `PathMemory` dataclass:
`path_title`, `current_state` (initial/growing/mature), `lesson_index`, `concept_graph`,
`recurring_misconceptions`, `exercise_bank`, `best_explanations` (placeholder M4),
`total_lessons`, `total_concepts`, `total_exercises`.

### LessonIndexEntry (frozen dataclass)

Entry nel lesson index: ordine, topics, conteggio concetti/esercizi, split new/reinforced.

**Citazione**: `lessonos/graph/path_memory.py:24-51` — `LessonIndexEntry`: `lesson_id`,
`title`, `topics`, `concept_count`, `exercise_count`, `new_concepts`, `reinforced_concepts`.
`from_capsule()` factory (linee 35-51).

### ConceptPathEntry (frozen dataclass)

Concetto aggregato across lezioni: dove introdotto, tutti gli status, tutte le lezioni, prerequisiti,
conteggio ripetizioni (SM-2 inspired), ultima lezione di revisione, fattore di difficolta D (FSRS).

**Citazione**: `lessonos/graph/path_memory.py:68-147` — `ConceptPathEntry`: `name`,
`first_introduced_lesson` (None se reinforced senza introduced), `statuses`, `lessons`, `prerequisites`,
`repetition_count` (default=1, quante lezioni coprono il concetto), `last_reviewed_lesson` (default=None,
la lezione piu recente in cui e apparso), `difficulty` (default=5.0, FSRS D factor in [1.0, 10.0]),
`estimated_retention` (None se non calcolato, power-law decay R = 1/(1+t/S) con scaling per difficolta).
`__post_init__` valida difficulty in [1.0, 10.0] — `lessonos/graph/path_memory.py:100-105`.
`update_after_review(quality)` — `lessonos/graph/path_memory.py:106-147`: ritorna un nuovo entità con
difficulty aggiornata dopo una risposta studente (quality 0-5, SM-2 scale), immutabile.

## Funzioni

### build_path_memory(capsules, *, path_title=None)

Costruisce `PathMemory` da una lista di `LessonCapsule`. Aggrega lesson_index,
concept_graph (case-insensitive merging), exercise_bank, recurring_misconceptions.

**Citazione**: `lessonos/graph/path_memory.py:195-266` — `build_path_memory()`.

**Parametri**: `nodes`/`edges` rimossi in v0 su review (placeholder M4 — Didactic Delta).

**Raises**: `ValueError` se capsules vuoto.

### _aggregate_concepts(capsules) -> tuple[ConceptPathEntry, ...]

Aggrega concetti con case-insensitive matching. Ordina per lezione di prima introduzione.

**Citazione**: `lessonos/graph/path_memory.py:93-139` — `_aggregate_concepts()`:
aggregazione via dict key `.lower()`, `first_intro` track al primo `status=="introduced"`.

### _collect_misconceptions(capsules) -> tuple[str, ...]

Raccoglie tutte le `student_questions` come misconception testuali.

**Citazione**: `lessonos/graph/path_memory.py:292-305`.

### compute_retention(rep_count, lessons_since_review, ...) -> float

Stima il retention rate con power-law decay, modulata da difficulty D (FSRS).

**Citazione**: `lessonos/graph/path_memory.py:110-201` — `compute_retention()`:
|`R = 1.0 / (1.0 + lessons_since_review / stability)` con scaling per difficulty.
|
|### predict_stability(review_history, *, initial_stability, stability_multiplier, difficulty) -> float
|
|Predice la stabilita per-concept da una sequenza di SM-2 quality scores (review history).
|FSRS-style: la qualita di ogni review modula la crescita:
|q=5: 100%, q=4: 80%, q=3: 50%, q<3: reset a initial_stability (fallimento = non ritenuto).
|
|**Citazione**: `lessonos/graph/path_memory.py:236-322` — `predict_stability()`:
|`S = S₀ * ∏(1 + (mult-1) * w(q) * scaling(D))` per review buone;
|fallimenti (q<3) resettano a S₀. `difficulty_scaling = (11 - D) / 6`.
|Empty history -> ValueError. Deterministico.
|
|Esportato da `lessonos/graph/__init__.py`.
|
|**Test**: `tests/test_predict_stability.py` — 11 test: singola/buona/multiplicativa/qualita-pesata/
|reset-fallimenti/empty-valueerror/integrazione-con-compute_retention.
|Review Claude Code: 5 fix (bug semantico reset q<3, bound rotto, naming, asserzioni esatte).
|445 passed + 2 skipped (baseline 434).
|
|## Design Rationale

1. **Pure derivazione** — ogni campo è calcolato deterministicamente dai capsule, zero LLM calls
2. **Case-insensitive** — i concetti si uniscono a prescindere dal casing (test: `test_concept_case_insensitive_aggregation`)
3. **Fail-safe per status** — un concetto `reinforced` senza `introduced` genera `first_introduced_lesson=None` (test: `test_concept_reinforced_never_introduced`)
4. **Stato path** — `current_state` riflette il numero di lezioni (initial=1, growing=2-3, mature=4+)
5. **M4 placeholder** — `best_explanations` duplica `exercise_bank` in v0; Didactic Delta (M4) selezionerà la migliore spiegazione per concetto

## Test Coverage

**File**: `tests/test_path_memory.py` — ~40 test (concept path, retention, difficulty, update, aggregation).

**Citazione**: STATUS.md — ultimo: 390 passed + 2 skipped.

## Dipendenze

- `lessonos/capsule/assembly.py` — `LessonCapsule`

### apply_review_feedback(memory, review_qualities) -> PathMemory

Applica feedback studente (SM-2 quality 0–5) per aggiornare difficulty D dei concetti in PathMemory.
Case-insensitive matching, normalizzazione centralizzata.

**Citazione**: `lessonos/graph/path_memory.py:431-535` — `apply_review_feedback()`:
riceve `PathMemory` + `dict[str, int]`, restituisce nuova PathMemory con `concept_graph` aggiornato.
Usa `ConceptPathEntry.update_after_review()` internamente. Solleva `ValueError` per concetti inesistenti
o duplicati case-insensitive.

**Test**: `tests/test_path_memory.py::TestApplyReviewFeedback` — 10 test (qualità buona/cattiva,
concept sconosciuto, dict vuoto, aggiornamento parziale, preservazione campi, immutabilità originale,
case-insensitive lookup, duplicati case-insensitive, case diverso su concept sconosciuto).

Esportato da `lessonos/graph/__init__.py:__all__`.
- `lessonos/capsule/extraction.py` — `ConceptExtraction`
