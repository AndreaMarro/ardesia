# Teacher Graph Aggregator (M1-1 / M1-1b)

Aggrega tutte le lezioni di un docente in un grafo unico: concetti deduplicati per nome canonico cross-lezione (M1-1b), status = piu avanzato, union di edges/evidence, cross-teacher guard.

## Funzioni principali

- `aggregate_teacher_graph(store, teacher_id) -> AggregatedPathGraph` — trova tutti i path del docente, carica capsule, merge concetti, edges, evidence. Cross-teacher guard: solo path con `teacher_id` match.
- `aggregate_path_graph(store, path_id) -> AggregatedPathGraph` — aggregazione per singolo path (backward compat, M3 originale).
- `load_path_capsules(store, path_id) -> list[LessonCapsule]` — carica capsule persistenti per un path.
- `_merge_concept_nodes(capsules) -> tuple[list[AggregatedPathNode], dict]` — deduplica per `canonical` se presente, fallback a nome normalizzato (lowercase, strip). M1-1b: la chiave di dedup e' `concept.canonical` se non vuoto, altrimenti `_normalize_name(concept.name)` (`lessonos/graph/aggregator.py:65`).

## Canonicalizzazione (M1-1b)

Il collante cross-lezione: i concetti hanno un campo `canonical` (nome breve normalizzato come 'segnale', 'energia', 'delta di Dirac') assegnato dall'LLM in extraction. L'aggregatore deduplica per `canonical` invece che per label esatta, risolvendo il problema che 'Definizione di segnale' e 'Il segnale come grandezza fisica' NON si univano.

**Backward compat**: capsule vecchie (senza `canonical`) restano con `canonical=''` → l'aggregatore fallisce a normalized name, comportamento identico a prima.

**Prompt extraction**: `build_extraction_prompt` ora include `canonical` nello schema `{name, canonical, status, prerequisites?, citations}` con istruzioni per avere nomi brevi stabili cross-lezione (`lessonos/capsule/extraction.py:184-187`).

## Modello dati

`teacher_id` (opzionale, `str | None`) aggiunto a `Path` (`lessonos/models/entities.py:62`). SCHEMA_VERSION 6→7 con migrazione ALTER TABLE (`lessonos/store/sqlite.py:107-114`). Nuovo metodo Store ABC: `paths_for_teacher(teacher_id)`.

`ConceptExtraction.canonical` (`lessonos/capsule/extraction.py:98`, M1-1b) — campo opzionale `str = ''`. Deserializzato in `_deserialise_capsule` (`lessonos/capsule/assembly.py:150`) con fallback `c.get("canonical", "")`.

## Invarianti

1. **Deduplicazione per canonical** (M1-1b): dedup key = `canonical` se presente, fallback a nome normalizzato.
2. **Status = max STATUS_ORDER**: `introduced(0) < reinforced(1) < reviewed(2) < problematic(3) < mastered(4)`.
3. **Cross-teacher contamination**: solo path con `teacher_id` match vengono caricati. Canonical non attraversa confini docente.
4. **Edge union**: tutti gli edge di tutte le lezioni preservati (dedup per `edge_id`).
5. **Evidence union**: tutte le evidenze preservate (dedup per `evidence_id`), ogni evidenza porta `lesson_id` per provenance.
6. **Grounding preservato**: canonical e' solo una label di dedup, non tocca citazioni/excerpt.

## Demo reale (Teoria dei Segnali 2021, teacher_id="andrea")

4 lezioni (`prima_lezione`, `seconda_lezione`, `terza_lezione`, `quarta_lezione`) aggregate via `aggregate_teacher_graph(store, "andrea")`:
- **96 concetti unici** (deduplicati su ~160 non-dedup) — *con canonical le ricorrenze aumenteranno: e' un campo LLM che va popolato rigenerando le capsule.*
- **130 edges**, **328 evidenze**
- 1 concetto ricorrente (pre-canonical): `Misura di Lebesgue` (lezioni 2 e 3)
- Status progressione visibile: `introduced->reinforced->reviewed`
- 5 concetti `problematic` (delta di Dirac, compressione/espansione, segnali periodici)

## File

- `lessonos/graph/aggregator.py` — implementazione (276 righe)
- `lessonos/models/entities.py:188-224` — AggregatedPathNode, AggregatedPathGraph
- `lessonos/store/base.py:24` — paths_for_teacher ABC
- `lessonos/store/sqlite.py:148-165` — paths_for_teacher SQLite implementation
- `lessonos/capsule/extraction.py:91-104` — ConceptExtraction.canonical
- `lessonos/capsule/assembly.py:150` — deserialize fallback
- `tests/test_graph_aggregator.py` — 21 test (4 per canonical dedup)
