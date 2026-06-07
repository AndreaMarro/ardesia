# Didactic Delta — Path-Level Diff (PLAN §3.3, M4)

Didactic Delta confronta due versioni di PathMemory (old vs new) e rileva
cosa è cambiato: concetti nuovi, chiariti, ancora aperti, ripetuti troppo,
poco esercitati, e spostamenti nelle misconceptions.

**Principio**: È il differenziatore LessonOS — "ogni lezione rende più
intelligente la prossima" (PLAN §3). Risponde: "Cosa ha cambiato questa
lezione nello stato di conoscenza del percorso?"

## Modulo

**File**: `lessonos/graph/didactic_delta.py`

## Entità

### DidacticDelta (frozen dataclass)

Report completo delle differenze tra due versioni di PathMemory.

**Citazione**: `lessonos/graph/didactic_delta.py:46-82` — `DidacticDelta` dataclass:
`new_concepts`, `clarified_concepts`, `still_open_concepts`,
`over_repeated_concepts`, `under_practiced_concepts`,
`new_misconceptions`, `resolved_misconceptions`, e campi `total_*`.

### DeltaConceptChange (frozen dataclass)

Come un singolo concetto è cambiato tra vecchia e nuova versione.

**Citazione**: `lessonos/graph/didactic_delta.py:31-43` — `DeltaConceptChange`:
`name`, `old_statuses`, `new_statuses`, `old_lessons`, `new_lessons`.

## Funzioni

### compute_didactic_delta(old_memory, new_memory)

Calcola il delta tra due PathMemory. Rileva:

1. **New concepts** — presenti in new ma non in old (introdotti dalla nuova lezione)
2. **Clarified concepts** — erano "problematic" in old, ora non-problematici (chiariti)
3. **Still-open concepts** — ancora "problematic" in new (debito persistente)
4. **Over-repeated concepts** — appaiono in 3+ lezioni (soglia `_OVER_REPEATED_THRESHOLD=3`)
5. **Under-practiced concepts** — in 2+ lezioni con pochi esercizi (v0 heuristic: keyword match nome concetto negli exercise prompt)
6. **New misconceptions** — student questions in new ma non in old
7. **Resolved misconceptions** — student questions in old ma non in new

**Citazione**: `lessonos/graph/didactic_delta.py:139-254` — `compute_didactic_delta()`.

**Raises**: `ValueError` se old o new hanno `concept_graph` vuoto.

## Categorie e Loro Logica

### New Concepts
Solo concetti in `new_memory.concept_graph` il cui nome lowercased NON è in
`old_memory.concept_graph`. Non subiscono altre categorizzazioni (sono "nuovi"
e basta — non possono essere clarified/still-open rispetto al passato).

**Citazione**: `lessonos/graph/didactic_delta.py:197-200`

### Clarified Concepts
Un concetto era `"problematic"` in old_statuses e ora ha almeno uno status
tra `"introduced"`, `"reinforced"`, `"reviewed"` in new_statuses.

**Citazione**: `lessonos/graph/didactic_delta.py:203-206`

### Still-Open Concepts
Un concetto ha `"problematic"` in `new_statuses`, indipendentemente da old.
È lo stato assoluto nel nuovo percorso — anche due versioni identiche con
un problematic mostrano still-open.

**Citazione**: `lessonos/graph/didactic_delta.py:208-210`

### Over-Repeated Concepts
Soglia: concept presente in `>=3` lezioni (`_OVER_REPEATED_THRESHOLD`).
Misura sulla new version.

**Citazione**: `lessonos/graph/didactic_delta.py:212-214`

### Under-Practiced Concepts
Concept in `>=2` lezioni ma con [esercizi che menzionano il nome] <
[numero lezioni]. v0 heuristic semplice via keyword match (nessun link
esplicito concetto→esercizio — M4-task2 Learning Debt può raffinare).

**Citazione**: `lessonos/graph/didactic_delta.py:116-136` — `_count_exercises_for_concept()`

## Test Coverage

**File**: `tests/test_didactic_delta.py` — 15 test.

Test coprono ogni categoria + edge cases:
- `test_detects_new_concepts`: concetti nuovi dalla nuova lezione
- `test_detects_clarified_concepts`: problematic → non-problematic
- `test_detects_still_open_concepts`: problematic persistente
- `test_detects_over_repeated_concepts`: 3+ lezioni
- `test_new_lesson_introduces_concept_and_leaves_debt`: scenario MILESTONES M4
- `test_detects_new_misconceptions`: nuove domande studente
- `test_detects_resolved_misconceptions`: domande rimosse
- `test_identical_versions_produce_empty_delta`: nessuna differenza
- `test_raises_on_empty_old`: ValueError per PathMemory vuota
- `test_under_practiced_concept_detected`: esercizi < lezioni
- `test_delta_immutable`: frozen dataclass
- `test_concept_change_same_fields`: DeltaConceptChange old/new statuses
- `test_delta_deterministic`: stessi input → stesso output
- `test_delta_concept_change_immutable`: DeltaConceptChange frozen
- `test_didactic_delta_summary_counts_match`: total_* = len(categoria)

## Design Rationale

1. **Content-based** — nessuna LLM call, pura computazione su dati esistenti (PathMemory)
2. **Case-insensitive** — merge concetti a prescindere dal casing (coerente con PathMemory)
3. **Fail-fast su empty** — ValueError se concept_graph vuoto (non fare confronti senza senso)
4. **Categorie independenti** — un concetto può apparire in più categorie (es. still_open + under_practiced)
5. **Under-practiced è heuristic** — v0 usa keyword match; M4-task2 Learning Debt può aggiungere link esplicito concetto→esercizio
6. **Cost-aware** — zero chiamate API, solo stdlib + dataclasses

## Dipendenze

- `lessonos/graph/path_memory.py` — `PathMemory`
- Solo Python stdlib (`dataclasses`)

## Milestone

M4-task1. M4 completo: M4-task2 Learning Debt, M4-task3 Next Lesson Planner, MILESTONES test (L4 fixture scenario) tutti LANDATO. Prossimo: M5 eval harness.
