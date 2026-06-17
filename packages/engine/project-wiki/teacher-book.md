# Teacher Book Builder (M1-2)

Struttura l'AggregatedPathGraph (M1-1 con canonical M1-1b) in un `TeacherBook` organizzato per sezioni tematiche — deterministico, ZERO-LLM.

## Modulo

`lessonos/teacher_book.py` (398 righe) — funzione principale:

```python
build_teacher_book(store, teacher_id) -> TeacherBook
```

Prende un teacher_id, carica l'aggregated graph (`aggregate_teacher_graph`), costruisce le sezioni:
- **Overview**: statistiche (total_concepts, total_lessons, total_edges, total_evidence)
- **Fundamental concepts**: concetti ordinati per `evidence_count` decrescente (enfasi pedagogica del docente)
- **Problematic concepts**: concetti con `status='problematic'`
- **Progression**: per ogni concetto, evoluzione dello status cross-lezione (e.g. `introduced→reinforced`), matchato per canonical (M1-1b) — 'Definizione di segnale' e 'Il segnale come grandezza fisica' sono riconosciuti come stesso concetto
- **Prerequisites**: dipendenze `depends_on` dal grafo come `PrerequisiteChain`

## Entità (entities.py)

| Entità | Campi | Descrizione |
|--------|-------|-------------|
| `TeacherConcept` | name, canonical, status, lesson_ids, edge_count, evidence_count, citations | Concetto con metadati aggregati e citazioni grounded |
| `ConceptProgression` | name, canonical, first_lesson, status_sequence, lesson_sequence | Evoluzione status cross-lezione |
| `PrerequisiteChain` | concept, canonical, prerequisites, lesson_ids | Dipendenze `depends_on` |
| `TeacherBook` | teacher_id + tutte le sezioni sopra | Contenitore principale |

Tutte frozen dataclass con validazione `__post_init__` su `CONCEPT_STATUS`.

## Architettura interna

1. `aggregate_teacher_graph()` → `AggregatedPathGraph` con merged_nodes, existing_edges, path_evidence
2. `_build_per_lesson_node_map()` → mappa `{(lesson_id, normalized_name): per_lesson_node_id}` per bridging tra nodi aggregati e per-lezione
3. `_count_edges_for_concept()` → conta edges che referenziano un concetto
4. `_build_citations()` → raccoglie tutte le evidenze per gli edges di un concetto
5. `_resolve_canonical()` → trova il `canonical` di un concetto dalle capsule
6. `_build_progression()` → matcha per canonical, ricostruisce sequenza status cross-lezione
7. `_build_prerequisites()` → segue edges `depends_on`, risolve nomi concetti

## Invarianti

1. **ZERO-LLM**: nessuna chiamata router, interamente deterministico
2. **Grounded**: ogni `TeacherConcept` porta le citazioni originali dal grafo (GraphEvidence con lesson_id, seg_id, excerpt)
3. **Cross-lesson matching**: la progression matcha per canonical (M1-1b), non per label ESATTA
4. **Backward compat**: funziona anche con capsule vecchie (senza canonical) — fallback a nome normalizzato
5. **No contaminazione**: teacher_id isolato, nessuna contaminazione cross-docente

## Test

9 test in `tests/test_teacher_book.py`:
- Basic: teacher singolo 2 lezioni, teacher sconosciuto (ValueError), grafo vuoto, singola lezione senza edges
- Sections: fundamental ranking, problematic filter, progression (canonical-matched cross-lezione), prerequisite chains, multi-path aggregation

## File

- `lessonos/teacher_book.py` — modulo (398 righe)
- `lessonos/models/entities.py:234-320` — TeacherConcept, ConceptProgression, PrerequisiteChain, TeacherBook
- `tests/test_teacher_book.py` — 9 test
