"""serve_method_graph: SERVE the PERSISTED prerequisite method graph (GS-3).

Unlike ``rank_bridge_concepts`` (which rebuilds the graph in-memory from a list
of capsules), ``serve_method_graph`` reads what GS-3 already PERSISTED in the
store — ``all_concept_nodes`` + cross-lesson ``all_depends_on_edges`` — and
projects it to a typed concept↔concept method graph plus the bridge ranking.

The end-to-end tests ingest real capsules through ``write_capsule_graph`` into a
real ``SQLiteStore``, so they exercise the genuine persisted graph (not a
hand-built fixture): the served bridge ranking and dependency set must reflect
exactly the cross-lesson ``depends_on`` edges that ingestion wrote.
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import Citation, ConceptExtraction, LessonContent
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.suggest import (
    BridgeConcept,
    MethodConcept,
    MethodDependency,
    MethodGraph,
    rank_bridge_concepts,
    serve_method_graph,
)
from lessonos.graph.writer import write_capsule_graph
from lessonos.models.entities import GraphEdge, GraphNode, Segment
from lessonos.store.sqlite import SQLiteStore


# --------------------------------------------------------------------------
# Helpers: ingest grounded capsules into a real SQLiteStore (GS-3 path).
# --------------------------------------------------------------------------


def _seg_id(lesson_id: str, i: int) -> str:
    return f"{lesson_id}#s{i}"


def _ingest_segments(store: SQLiteStore, lesson_id: str, n: int) -> None:
    for i in range(n):
        text = f"Segment {i} of {lesson_id}: a real sentence long enough to cite."
        store.save_segment(
            Segment(
                seg_id=_seg_id(lesson_id, i),
                lesson_id=lesson_id,
                start=i * 10,
                end=i * 10 + 10,
                text=text,
            )
        )


def _capsule(
    lesson_id: str, concepts: list[tuple[str, tuple[str, ...]]]
) -> LessonCapsule:
    extractions = []
    for i, (name, prereqs) in enumerate(concepts):
        text = f"Segment {i} of {lesson_id}: a real sentence long enough to cite."
        extractions.append(
            ConceptExtraction(
                name=name,
                status="introduced",
                prerequisites=prereqs,
                citations=(
                    Citation(seg_id=_seg_id(lesson_id, i), excerpt=text[:20], confidence=0.9),
                ),
            )
        )
    content = LessonContent(lesson_id=lesson_id, concepts=tuple(extractions))
    timeline = (
        TopicSpan(
            lesson_id=lesson_id,
            topic="Intro",
            seg_ids=(_seg_id(lesson_id, 0),),
            start=0,
            end=10,
        ),
    )
    return LessonCapsule(lesson_id=lesson_id, timeline=timeline, content=content)


def _build_signal_corpus(store: SQLiteStore) -> None:
    """foundations → Fourier (bridge) ← advanced, INGESTED across 3 lessons.

    l1: Segnale, Funzione (leaves, no prereqs)
    l2: Trasformata di Fourier  depends_on Segnale, Funzione
    l3: Spettro, Sistema LTI    depend_on Trasformata di Fourier

    Fourier is the unique articulation point between foundations and advanced,
    so it must rank first by betweenness in the SERVED (persisted) graph.
    """
    _ingest_segments(store, "l1", 2)
    _ingest_segments(store, "l2", 1)
    _ingest_segments(store, "l3", 2)
    write_capsule_graph(store, _capsule("l1", [("Segnale", ()), ("Funzione", ())]))
    write_capsule_graph(
        store,
        _capsule("l2", [("Trasformata di Fourier", ("segnale", "funzione"))]),
    )
    write_capsule_graph(
        store,
        _capsule(
            "l3",
            [
                ("Spettro", ("Trasformata di Fourier",)),
                ("Sistema LTI", ("trasformata di fourier",)),
            ],
        ),
    )


# --------------------------------------------------------------------------
# Served graph reflects the PERSISTED corpus, not an in-memory rebuild.
# --------------------------------------------------------------------------


def test_served_graph_has_typed_shape():
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    mg = serve_method_graph(store)
    assert isinstance(mg, MethodGraph)
    assert all(isinstance(c, MethodConcept) for c in mg.concepts)
    assert all(isinstance(d, MethodDependency) for d in mg.dependencies)
    assert all(isinstance(b, BridgeConcept) for b in mg.bridges)
    # All five concepts present once, collapsed by canonical key, sorted by key.
    assert [c.label for c in mg.concepts] == [
        "Funzione",
        "Segnale",
        "Sistema LTI",
        "Spettro",
        "Trasformata di Fourier",
    ]
    assert [c.key for c in mg.concepts] == sorted(c.key for c in mg.concepts)


def test_served_dependencies_are_the_persisted_depends_on_edges():
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    mg = serve_method_graph(store)

    label_by_key = {c.key: c.label for c in mg.concepts}
    deps = {
        (label_by_key[d.source_key], label_by_key[d.target_key])
        for d in mg.dependencies
    }
    # Exactly the cross-/within-lesson prereq edges GS-3 persisted.
    assert deps == {
        ("Trasformata di Fourier", "Segnale"),
        ("Trasformata di Fourier", "Funzione"),
        ("Spettro", "Trasformata di Fourier"),
        ("Sistema LTI", "Trasformata di Fourier"),
    }
    # Provenance/confidence carried from the persisted edge metadata.
    spettro = next(
        d for d in mg.dependencies if label_by_key[d.source_key] == "Spettro"
    )
    assert spettro.provenance == "auto-suggested"
    assert spettro.confidence == 0.8


def test_bridge_ranks_first_from_persisted_graph():
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    mg = serve_method_graph(store)
    top = mg.bridges[0]
    assert top.name == "Trasformata di Fourier"
    assert top.centrality > 0.0
    # Every other concept is strictly less central (it is the unique bridge).
    assert all(top.centrality > b.centrality for b in mg.bridges[1:])
    # Leaves and sinks are not bridges.
    by_name = {b.name: b for b in mg.bridges}
    for leaf in ("Segnale", "Funzione", "Spettro", "Sistema LTI"):
        assert by_name[leaf].centrality == 0.0


def test_serving_reflects_a_re_ingest_unlike_a_stale_inmemory_build():
    """SERVING reads the live persisted graph: a re-ingest is reflected.

    Ingest the corpus, then re-ingest l3 dropping Sistema LTI's prereq. The
    served graph must lose exactly that edge — proving it serves the persisted
    state, not a cached/rebuilt one.
    """
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    before = serve_method_graph(store)
    assert len(before.dependencies) == 4

    # Re-ingest l3 with Sistema LTI no longer depending on Fourier.
    write_capsule_graph(
        store,
        _capsule(
            "l3",
            [
                ("Spettro", ("Trasformata di Fourier",)),
                ("Sistema LTI", ()),
            ],
        ),
    )
    after = serve_method_graph(store)
    label_by_key = {c.key: c.label for c in after.concepts}
    deps = {
        (label_by_key[d.source_key], label_by_key[d.target_key])
        for d in after.dependencies
    }
    assert ("Sistema LTI", "Trasformata di Fourier") not in deps
    assert ("Spettro", "Trasformata di Fourier") in deps
    assert len(after.dependencies) == 3


def test_empty_store_serves_empty_graph():
    store = SQLiteStore(":memory:")
    mg = serve_method_graph(store)
    assert mg == MethodGraph(concepts=(), dependencies=(), bridges=())


def test_base_store_default_serves_empty_graph():
    """A backend that does not enumerate the corpus serves empty, never errors."""

    class _NoEnumStore:
        def all_concept_nodes(self):
            return ()

        def all_depends_on_edges(self):
            return ()

    mg = serve_method_graph(_NoEnumStore())  # type: ignore[arg-type]
    assert mg == MethodGraph(concepts=(), dependencies=(), bridges=())


def test_serving_is_deterministic():
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    a = serve_method_graph(store)
    b = serve_method_graph(store)
    assert a == b
    # Dependencies sorted by (source_key, target_key).
    pairs = [(d.source_key, d.target_key) for d in a.dependencies]
    assert pairs == sorted(pairs)


def test_duplicate_canonical_pair_collapses_to_one_dependency():
    """Two positional edges that fold to the same canonical pair → one edge.

    A served method graph is concept-level: distinct lesson occurrences of the
    same canonical concept must not produce parallel prerequisite edges.
    """

    class _DupStore:
        def all_concept_nodes(self):
            return (
                GraphNode("l1:concept:0", "concept", "l1:concept:0", "Derivata"),
                GraphNode("l2:concept:0", "concept", "l2:concept:0", "derivata"),
                GraphNode("l3:concept:0", "concept", "l3:concept:0", "Limite"),
            )

        def all_depends_on_edges(self):
            # Both Derivata occurrences depend on Limite → same canonical pair.
            return (
                GraphEdge(
                    "l1:concept:0-depends_on->l3:concept:0",
                    "l1:concept:0",
                    "l3:concept:0",
                    "depends_on",
                    {"provenance": "auto-suggested", "confidence": "0.8"},
                ),
                GraphEdge(
                    "l2:concept:0-depends_on->l3:concept:0",
                    "l2:concept:0",
                    "l3:concept:0",
                    "depends_on",
                    {"provenance": "auto-suggested-fuzzy", "confidence": "0.9"},
                ),
            )

    mg = serve_method_graph(_DupStore())  # type: ignore[arg-type]
    assert len(mg.dependencies) == 1
    dep = mg.dependencies[0]
    assert dep.source_key == "derivata"
    assert dep.target_key == "limite"
    # First persisted edge by edge_id order wins its provenance.
    assert dep.provenance == "auto-suggested"
    assert dep.confidence == 0.8
    # The two Derivata occurrences collapse to one concept.
    derivata = next(c for c in mg.concepts if c.key == "derivata")
    assert set(derivata.node_ids) == {"l1:concept:0", "l2:concept:0"}


def test_serving_matches_in_memory_ranking_on_same_topology():
    """serve_method_graph (persisted) and rank_bridge_concepts (in-memory)
    agree on the bridge ordering for the same corpus — two independent paths to
    the same topology must not disagree."""
    store = SQLiteStore(":memory:")
    _build_signal_corpus(store)
    served = [b.name for b in serve_method_graph(store).bridges]

    capsules = [
        _capsule("l1", [("Segnale", ()), ("Funzione", ())]),
        _capsule("l2", [("Trasformata di Fourier", ("segnale", "funzione"))]),
        _capsule(
            "l3",
            [
                ("Spettro", ("Trasformata di Fourier",)),
                ("Sistema LTI", ("trasformata di fourier",)),
            ],
        ),
    ]
    in_memory = [b.name for b in rank_bridge_concepts(capsules)]
    # The bridge (rank 0) agrees; both surface Fourier as the top concept.
    assert served[0] == in_memory[0] == "Trasformata di Fourier"
