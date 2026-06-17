# Lesson Graph — cross-lesson edges attivati

## Cosa

Il Lesson Graph è un **networkx DiGraph** che modella concetti, esercizi e lezioni come nodi, con archi tipizzati (EDGE_TYPES) tra di loro. A livello di singola lezione (`build_lesson_graph`) cattura relazioni intra-lezione; a livello di percorso (`build_path_graph`) aggiunge archi cross-lezione come `repeats` (stesso concetto in lezioni diverse) e `depends_on` (prerequisiti tra concetti di lezioni diverse).

## Costruzione

### `build_lesson_graph(capsule)` — per-lezione
- Nodi: lesson (1), concept (1 per concept), exercise (1 per exercise)
- Archi: `explains` (lesson → ogni concept), `assigned_in` (lesson → ogni exercise)
- IDs deterministici: `<lesson_id>:concept:<N>`, `<lesson_id>:exercise:<N>`
- Fonte: `lessonos/graph/builder.py:16-85`

### `build_path_graph(capsules)` — cross-lezione
- Combina tutti i grafi per-lezione
- **Archi `repeats`**: stesso concetto (case-insensitive) in ≥2 lezioni → edge dalla lezione precedente alla successiva. Provenance: `auto-suggested`, confidence 0.7
- **Archi `depends_on`**: concept.prerequisites matcha un altro concept_name nello stesso path → edge dal concept al suo prerequisito. Provenance: `auto-suggested`, confidence 0.8
- **DAG validation**: verifica che il grafo sia aciclico (ValueError se ciclico) — `lessonos/graph/builder.py:190-195`
- Fonte: `lessonos/graph/builder.py:88-197`

## Query

Le funzioni in `lessonos/graph/queries.py` convertono i nodi/archi in networkx.DiGraph e lo interrogano:
- `find_concept(G, name)` — case-insensitive, ritorna node_ids
- `where_introduced(G, name)` — prima lezione che introduce il concetto
- `where_reinforced(G, name)` — lezioni successive che lo rinforzano (esclude introduzione)
- `prerequisites_of(G, name)` — prerequisiti diretti (via archi depends_on)
- `all_prerequisites_deep(G, name)` — BFS transitivo dei prerequisiti
- `topological_concepts(G)` — ordine pedagogico (prerequisiti prima)
- `build_networkx_graph(nodes, edges)` — converter per GraphNode/GraphEdge → nx.DiGraph
- Fonte: `lessonos/graph/queries.py:1-308`

## Integrazione pipeline

`run_pipeline()` in `lessonos/pipeline.py:571` chiama `build_path_graph(final_capsules)` dopo l'assemblaggio capsule. `PipelineResult.graph_nodes` e `PipelineResult.graph_edges` espongono il grafo al chiamante.

## Test

- `tests/test_graph_builder.py` — 38 test: build_lesson_graph (7), build_path_graph (10), query (18), esportazioni (3)
- `tests/test_pipeline.py` — 6 test: wiring pipeline
- Invariante chiave: `len(explains_edges) == len(concept_nodes)` nel grafo combinato

## Convenzioni

- Tutti gli edge_type validati contro EDGE_TYPES (11 tipi, `lessonos/models/entities.py:15-29`)
- GraphNode/GraphEdge frozen, ValueError su tipo invalido
- Ogni concept ha un solo explains edge dalla sua lezione
- Repeats edges: solo tra lezioni diverse (stessa lezione non può ripetersi)
