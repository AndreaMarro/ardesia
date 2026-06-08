# Next Lesson Planner — Agenda Prioritizzata (PLAN §8.2, M4-task3)

Il Next Lesson Planner produce un'agenda strutturata per la prossima lezione del percorso, combinando PathMemory (stato attuale), DidacticDelta (cosa è cambiato) e LearningDebtLedger (debito pendente).

**Principio**: Trasforma dati strutturati esistenti in un piano didattico azionabile — zero chiamate LLM, zero persistenza DB, pura computazione.

## Modulo

**File**: `lessonos/graph/next_lesson_planner.py`

### Entità

#### NextLessonPlan (frozen dataclass)

`lessonos/graph/next_lesson_planner.py:75-103` — piano completo per la prossima lezione:
- `path_id` — qualificatore del percorso
- `review_items` — concetti da ripassare (da debito unmastered_concept)
- `practice_items` — esercizi da assegnare (da debito under_practiced)
- `new_material_items` — nuovi concetti da rinforzare (da delta.new_concepts, non ancora in ≥2 lezioni)
- `prerequisite_gaps` — prerequisiti da coprire prima (da debito weak_prerequisite)
- `open_doubt_items` — domande studente da affrontare (da debito open_doubt)
- `suggested_topics` — topic suggeriti in ordine di priorità
- `downstream_prerequisite_concepts` — concetti che sono prerequisiti per altri concetti nel path (bloccano apprendimento downstream)

#### LessonAgendaItem (frozen dataclass)

`lessonos/graph/next_lesson_planner.py:33-63` — item singolo dell'agenda:
- `kind` — `prerequisite_gap`, `review`, `open_doubt`, `practice`, `new_material`
- `description` — descrizione umana di cosa fare
- `source_debt_ids` — riferimenti ai LearningDebtItem.debt_id che hanno originato l'item
- `priority` — 0 (più urgente, prerequisiti) → 4 (meno urgente, materiale nuovo)
| `recommended_review_day` — giorno lezione raccomandato per la revisione (da FSRS scheduling con target retention ottimale: `optimal_desired_retention(D, rep_count)` modulata per difficoltà e ripetizioni, NON fissa a 0.9)

## Funzione Principale

### compute_next_lesson_plan(memory, delta, ledger, path_id="p1")

`lessonos/graph/next_lesson_planner.py:237-335` — calcola il piano.

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `memory` | `PathMemory` | PathMemory corrente (concept_graph) |
| `delta` | `DidacticDelta` | Delta tra vecchia e nuova versione |
| `ledger` | `LearningDebtLedger` | Debito corrente |
| `path_id` | `str` | Opzionale, default "p1" |

**Ritorna**: `NextLessonPlan` con item raggruppati per categoria.

**Raises**: `ValueError` se `memory.concept_graph` è vuoto.

### Downstream Prerequisite Chain Detection (2026-06-10)

`lessonos/graph/next_lesson_planner.py:52-68` — `_compute_downstream_prerequisites(memory)`

Automaticamente rileva concetti che sono prerequisiti per altri concetti nel path (cross-reference su PathMemory.concept_graph). Questi concetti hanno urgenza maggiore nel piano perché risolverli sblocca apprendimento downstream. Ispirato da GRKT (arXiv 2406.12896) graph-based knowledge tracing.

**Meccanismo**:
1. Scansiona ogni `ConceptPathEntry.prerequisites`
2. Per ogni prerequisito dichiarato, verifica che esista nel concept_graph
3. I nomi di concetto esistenti nel path che sono prerequisiti per altri vengono aggiunti a `downstream_prerequisite_concepts`

**Ordinamento**:
- `_build_review_items` (`:75-108`): concetti downstream sorted BEFORE non-downstream a parità di retention (tertiary sort key dopo retention)
- `_build_prerequisite_gap_items` (`:188-210`): gap items che sono anche downstream blocker sorted BEFORE

## Ordine di Priorità

1. **prerequisite_gap** (priority 0) — prerequisiti mancanti, blocca tutto
2. **review** (priority 1) — concetti ancora problematici da chiarire
3. **open_doubt** (priority 2) — domande studente irrisolte
4. **practice** (priority 3) — concetti poco esercitati
5. **new_material** (priority 4) — concetti nuovi da rinforzare

## Dipendenze

- `lessonos/graph/path_memory.py` — PathMemory
- `lessonos/graph/didactic_delta.py` — DidacticDelta
- `lessonos/graph/learning_debt.py` — LearningDebtLedger
- Solo Python stdlib (`dataclasses`)

## Design Rationale

1. **Content-based** — nessuna LLM call, pura computazione su dati esistenti
2. **Priority-ordering** — prerequisite gaps>review>open_doubt>practice>new_material
3. **Rintracciabile** — ogni LessonAgendaItem.source_debt_ids collega al debito che lo ha originato
4. **Fail-fast su empty** — ValueError se concept_graph vuoto
5. **Cost-aware** — zero chiamate API, solo stdlib + dataclasses

## Milestone

M4-task3. MILESTONES test M4 (L4 scenario) coperto da `test_milestones_m4_new_concept_plus_debt_from_l2` in `tests/test_didactic_delta.py:249-327` (mock capsule). L4 fixture reale esiste in `fixtures/sample_path/lessons/l4_integral_substitution.json`. M4 COMPLETO. Prossimo: M5 eval harness.
