# Path Memory — Aggregazione Path-Level (PLAN §26.2)

Path Memory è l'aggregazione progressiva di tutti i Lesson Capsules di un percorso.
Costruita da `build_path_memory()` in `lessonos/graph/path_memory.py`.

## Modulo

**File**: `lessonos/graph/path_memory.py`

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

**Citazione**: `lessonos/graph/path_memory.py:68-113` — `ConceptPathEntry`: `name`,
`first_introduced_lesson` (None se reinforced senza introduced), `statuses`, `lessons`, `prerequisites`,
`repetition_count` (default=1, quante lezioni coprono il concetto), `last_reviewed_lesson` (default=None,
la lezione piu recente in cui e apparso), `difficulty` (default=5.0, FSRS D factor in [1.0, 10.0]),
`estimated_retention` (None se non calcolato, power-law decay R = 1/(1+t/S) con scaling per difficolta).
`__post_init__` valida difficulty in [1.0, 10.0] — `lessonos/graph/path_memory.py:100-105`.

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

## Design Rationale

1. **Pure derivazione** — ogni campo è calcolato deterministicamente dai capsule, zero LLM calls
2. **Case-insensitive** — i concetti si uniscono a prescindere dal casing (test: `test_concept_case_insensitive_aggregation`)
3. **Fail-safe per status** — un concetto `reinforced` senza `introduced` genera `first_introduced_lesson=None` (test: `test_concept_reinforced_never_introduced`)
4. **Stato path** — `current_state` riflette il numero di lezioni (initial=1, growing=2-3, mature=4+)
5. **M4 placeholder** — `best_explanations` duplica `exercise_bank` in v0; Didactic Delta (M4) selezionerà la migliore spiegazione per concetto

## Test Coverage

**File**: `tests/test_path_memory.py` — 14 test.

**Citazione**: STATUS.md:22 — "Gate VERDE: 136 passed + 1 skipped (baseline 134 → 136, no regressione)."

## Dipendenze

- `lessonos/capsule/assembly.py` — `LessonCapsule`
- `lessonos/capsule/extraction.py` — `ConceptExtraction`
