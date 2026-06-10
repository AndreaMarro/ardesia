# Graph Writer (T5)

| Property | Value |
|---|---|
| **Module** | `lessonos/graph/writer.py` |
| **Class** | `GraphWriter` |
| **SCHEMA_VERSION** | 6 (5→6 in `lessonos/store/sqlite.py:18`) |
| **LLM calls** | 0 (pure deterministic projection) |

## Scopo

Proietta una `LessonCapsule` in tabelle SQLite relazionali (`nodes`, `edges`, `evidence`). È il T5 del filo verticale M0 — dopo ASR (T4a) e capsule (T4b), il grafo va in SQLite per query strutturate (FTS5 già gestito da `lessonos/retrieval/fts.py`).

## Tabelle

### `nodes`
- `node_id TEXT PRIMARY KEY` — deterministico: `<lesson_id>:<type>:<idx>` (es. `l1:concept:0`)
- `lesson_id TEXT NOT NULL`
- `node_type TEXT NOT NULL` — `lesson`, `concept`, `exercise`
- `ref_id TEXT NOT NULL` — same as node_id
- `label TEXT` — nome del concetto (None per lesson/exercise)

### `edges`
- `edge_id TEXT PRIMARY KEY` — deterministico: `<source>-<edge_type>-><target>`
- `lesson_id TEXT NOT NULL`
- `source TEXT NOT NULL` → `nodes.node_id`
- `target TEXT NOT NULL` → `nodes.node_id`
- `edge_type TEXT NOT NULL` — vincolato da `EDGE_TYPES` (entities.py:15-28)
- `metadata TEXT` — JSON, da `GraphEdge.metadata`

### `evidence`
- `evidence_id TEXT PRIMARY KEY` — deterministico: `{edge_id}#ev{idx}`
- `edge_id TEXT NOT NULL` → `edges.edge_id`
- `seg_id TEXT NOT NULL` → `segments.seg_id`
- `excerpt TEXT` — verbatim substring del segment text
- `confidence REAL`
- `lesson_id TEXT NOT NULL`

## GraphWriter

### `write_capsule_graph(capsule) → int`

1. `store.delete_graph_for_lesson(lesson_id)` (idempotenza)
2. `build_lesson_graph(capsule)` → (nodes, edges) — ZERO LLM
3. Per ogni node: `store.save_graph_node(lesson_id, node)`
4. Per ogni edge: `_collect_evidence(capsule, edge)` → evidence list, poi salva edge + evidence

Ritorna il numero di edges scritti.

### Grounding validation (`writer.py:83-90`)

Ogni evidence ha 2 controlli di grounding:
1. **seg_id risolto**: `store.get_segment(cit.seg_id)` → `ValueError` se `None`
2. **excerpt verbatim**: se excerpt non è `None`, deve essere substring di `seg.text` → `ValueError` se non lo è

### Edge→citation mapping

| Edge type | Fonte citations |
|---|---|
| `explains` | `capsule.content.concepts[i].citations` |
| `assigned_in` | `capsule.content.exercises[i].citations` |
| altri (repeats, depends_on) | Nessuna evidenza ora (path-level in T5-task2) |

## Store ABC (nuovi metodi)

`lessonos/store/base.py:93-123`:

- `save_graph_node(lesson_id, node)`
- `get_graph_nodes_for_lesson(lesson_id) → tuple[GraphNode]`
- `save_graph_edge(lesson_id, edge)`
- `get_graph_edges_for_lesson(lesson_id) → tuple[GraphEdge]`
- `save_evidence(evidence)`
- `get_evidence_for_edge(edge_id) → tuple[GraphEvidence]`
- `get_all_evidence_for_lesson(lesson_id) → tuple[GraphEvidence]`
- `delete_graph_for_lesson(lesson_id)`

## Test

`tests/test_graph_writer.py` — 14 test:

- write_smoke: nodes/edges/evidence scritti correttamente
- real-excerpt: ogni evidence.excerpt è substring del segmento
- no-citations: edge senza citazioni → salvato senza evidence
- ValueError su seg_id inesistente
- ValueError su excerpt non verbatim
- idempotenza: 2 scritture → stesso risultato (nodes, edges, evidence)
- convenience function `write_capsule_graph` a livello di modulo

## Citazioni

- `lessonos/graph/writer.py` — GraphWriter: 139 righe
- `lessonos/store/sqlite.py:18` — SCHEMA_VERSION 6
- `lessonos/store/sqlite.py:70-93` — tabelle nodes/edges/evidence
- `lessonos/store/base.py:93-123` — 8 metodi astratti
- `lessonos/models/entities.py:160-173` — GraphEvidence dataclass
- `tests/test_graph_writer.py` — 14 test
- `tests/test_excerpt_repair.py:196-203` — _SimpleStore stub fix
