# Teacher Graph Aggregator (M1-1)

Aggrega tutte le lezioni di un docente in un grafo unico: concetti deduplicati per nome normalizzato, status = piu avanzato, union di edges/evidence, cross-teacher guard.

## Funzioni principali

- `aggregate_teacher_graph(store, teacher_id) -> AggregatedPathGraph` — trova tutti i path del docente, carica capsule, merge concetti, edges, evidence. Cross-teacher guard: solo path con `teacher_id` match.
- `aggregate_path_graph(store, path_id) -> AggregatedPathGraph` — aggregazione per singolo path (backward compat, M3 originale).
- `load_path_capsules(store, path_id) -> list[LessonCapsule]` — carica capsule persistenti per un path.
- `_merge_concept_nodes(capsules) -> tuple[list[AggregatedPathNode], dict]` — deduplica per nome normalizzato (lowercase, strip).

## Modello dati

`teacher_id` (opzionale, `str | None`) aggiunto a `Path` (`lessonos/models/entities.py:62`). SCHEMA_VERSION 6→7 con migrazione ALTER TABLE (`lessonos/store/sqlite.py:107-114`). Nuovo metodo Store ABC: `paths_for_teacher(teacher_id)`.

## Invarianti

1. **Deduplicazione per nome normalizzato**: case/whitespace insensitive (`_normalize_name`).
2. **Status = max STATUS_ORDER**: `introduced(0) < reinforced(1) < reviewed(2) < problematic(3) < mastered(4)`.
3. **Cross-teacher contamination**: solo path con `teacher_id` match vengono caricati.
4. **Edge union**: tutti gli edge di tutte le lezioni preservati (dedup per `edge_id`).
5. **Evidence union**: tutte le evidenze preservate (dedup per `evidence_id`), ogni evidenza porta `lesson_id` per provenance.

## Demo reale (Teoria dei Segnali 2021, teacher_id="andrea")

4 lezioni (`prima_lezione`, `seconda_lezione`, `terza_lezione`, `quarta_lezione`) aggregate via `aggregate_teacher_graph(store, "andrea")`:
- **96 concetti unici** (deduplicati su ~160 non-dedup)
- **130 edges**, **328 evidenze**
- 1 concetto ricorrente: `Misura di Lebesgue` (lezioni 2 e 3)
- Status progressione visibile: `introduced->reinforced->reviewed`
- 5 concetti `problematic` (delta di Dirac, compressione/espansione, segnali periodici)

## File

- `lessonos/graph/aggregator.py` — implementazione (267 righe)
- `lessonos/models/entities.py:188-224` — AggregatedPathNode, AggregatedPathGraph
- `lessonos/store/base.py:24` — paths_for_teacher ABC
- `lessonos/store/sqlite.py:148-165` — paths_for_teacher SQLite implementation
- `tests/test_graph_aggregator.py` — 17 test (5 nuovi per teacher graph)
