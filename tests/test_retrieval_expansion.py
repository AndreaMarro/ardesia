"""Method-graph query expansion for single-teacher recap retrieval.

Two layers:

1. Pure units on ``expand_query_with_bridges`` over a hand-built ``MethodGraph``:
   anchor matching, bidirectional neighbourhood, centrality ordering, the
   ``max_bridges`` cut, and the no-match / invalid-input edges.
2. End-to-end VALUE on a real ``SQLiteStore``: a teacher's recap query for a
   downstream concept misses its prerequisite lesson under bare retrieval, but
   the method-graph bridge expansion surfaces it — while retrieval stays
   grounded ONLY in that teacher's corpus (the CRM boundary holds even though
   the served method graph is global).
"""

from __future__ import annotations

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import Citation, ConceptExtraction, LessonContent
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.suggest import (
    BridgeConcept,
    MethodConcept,
    MethodDependency,
    MethodGraph,
    serve_method_graph,
)
from lessonos.graph.utils import canonical_match_key
from lessonos.graph.writer import write_capsule_graph
from lessonos.models.entities import Lesson, Path, Segment
from lessonos.retrieval.expansion import (
    ExpandedQuery,
    expand_query_with_bridges,
    retrieve_teacher_context_with_bridges,
)
from lessonos.retrieval.teacher import retrieve_teacher_context
from lessonos.store.sqlite import SQLiteStore


# ── hand-built method graph: foundations → Fourier (bridge) → advanced ─────


def _signal_method_graph() -> MethodGraph:
    """The collapsed Segnale/Funzione → Fourier → Spettro/LTI prereq graph.

    Mirrors the persisted graph ``serve_method_graph`` produces from the signal
    corpus, but built directly so the unit tests pin expansion behaviour without
    a store. Fourier is the unique articulation point (centrality > 0); the four
    leaves/sinks are centrality 0.
    """
    labels = {
        "Segnale": 0.0,
        "Funzione": 0.0,
        "Trasformata di Fourier": 0.5,
        "Spettro": 0.0,
        "Sistema LTI": 0.0,
    }
    concepts = tuple(
        MethodConcept(
            key=canonical_match_key(label),
            label=label,
            node_ids=(f"n:{canonical_match_key(label)}",),
        )
        for label in labels
    )
    key = canonical_match_key
    dependencies = tuple(
        MethodDependency(source_key=key(s), target_key=key(t), provenance=None, confidence=None)
        for s, t in (
            ("Trasformata di Fourier", "Segnale"),
            ("Trasformata di Fourier", "Funzione"),
            ("Spettro", "Trasformata di Fourier"),
            ("Sistema LTI", "Trasformata di Fourier"),
        )
    )
    bridges = tuple(
        BridgeConcept(name=label, key=key(label), centrality=c, node_ids=())
        for label, c in sorted(labels.items(), key=lambda kv: (-kv[1], key(kv[0])))
    )
    return MethodGraph(concepts=concepts, dependencies=dependencies, bridges=bridges)


class TestExpandQueryWithBridges:
    def test_anchor_pulls_in_prerequisite_bridge(self) -> None:
        """A recap of a downstream concept expands toward its prereq bridge."""
        mg = _signal_method_graph()
        out = expand_query_with_bridges("ripasso dello spettro", mg)
        assert isinstance(out, ExpandedQuery)
        assert out.matched_concepts == (canonical_match_key("Spettro"),)
        assert out.bridge_terms == ("Trasformata di Fourier",)
        assert out.text == "ripasso dello spettro Trasformata di Fourier"

    def test_subset_token_anchor_ignores_articles(self) -> None:
        """Anchor matches on content tokens, so articles/prepositions don't block."""
        mg = _signal_method_graph()
        out = expand_query_with_bridges("la trasformata di Fourier", mg)
        assert out.matched_concepts == (canonical_match_key("Trasformata di Fourier"),)

    def test_neighbourhood_is_bidirectional(self) -> None:
        """Fourier's neighbours are BOTH its prereqs and its dependents."""
        mg = _signal_method_graph()
        out = expand_query_with_bridges("trasformata di Fourier", mg, max_bridges=4)
        # All four neighbours (leaves, centrality 0) ranked by key ascending.
        assert set(out.bridge_terms) == {"Funzione", "Segnale", "Sistema LTI", "Spettro"}

    def test_centrality_orders_bridges_first(self) -> None:
        """When a high-centrality neighbour competes, it is added first."""
        mg = _signal_method_graph()
        # Anchor on both a leaf and a sink so Fourier is a shared neighbour.
        out = expand_query_with_bridges("segnale spettro", mg, max_bridges=1)
        # Neighbours: Fourier (0.5, shared) beats the other leaf neighbours (0.0).
        assert out.bridge_terms == ("Trasformata di Fourier",)

    def test_max_bridges_caps_terms(self) -> None:
        mg = _signal_method_graph()
        out = expand_query_with_bridges("trasformata di Fourier", mg, max_bridges=2)
        assert len(out.bridge_terms) == 2
        # Centrality ties → key ascending: Funzione, Segnale.
        assert out.bridge_terms == ("Funzione", "Segnale")

    def test_max_bridges_zero_returns_unchanged(self) -> None:
        mg = _signal_method_graph()
        out = expand_query_with_bridges("spettro", mg, max_bridges=0)
        assert out.bridge_terms == ()
        assert out.text == "spettro"
        # Anchors are still reported even when nothing is appended.
        assert out.matched_concepts == (canonical_match_key("Spettro"),)

    def test_no_concept_mentioned_is_passthrough(self) -> None:
        mg = _signal_method_graph()
        out = expand_query_with_bridges("argomento non in grafo", mg)
        assert out.matched_concepts == ()
        assert out.bridge_terms == ()
        assert out.text == "argomento non in grafo"

    def test_isolated_concept_has_no_neighbour(self) -> None:
        """A concept with no edges anchors but adds nothing."""
        mg = MethodGraph(
            concepts=(MethodConcept(key="solo", label="Solo", node_ids=()),),
            dependencies=(),
            bridges=(BridgeConcept(name="Solo", key="solo", centrality=0.0, node_ids=()),),
        )
        out = expand_query_with_bridges("ripasso di Solo", mg)
        assert out.matched_concepts == ("solo",)
        assert out.bridge_terms == ()
        assert out.text == "ripasso di Solo"

    def test_blank_query_raises(self) -> None:
        mg = _signal_method_graph()
        with pytest.raises(ValueError, match="query must be non-empty"):
            expand_query_with_bridges("   ", mg)

    def test_negative_max_bridges_raises(self) -> None:
        mg = _signal_method_graph()
        with pytest.raises(ValueError, match="max_bridges must be non-negative"):
            expand_query_with_bridges("spettro", mg, max_bridges=-1)

    def test_empty_graph_is_passthrough(self) -> None:
        empty = MethodGraph(concepts=(), dependencies=(), bridges=())
        out = expand_query_with_bridges("spettro", empty)
        assert out == ExpandedQuery(text="spettro", matched_concepts=(), bridge_terms=())


# ── end-to-end: real store, teacher-scoped, method-graph expansion ─────────


def _save_lesson(store: SQLiteStore, *, path_id: str, lesson_id: str, text: str) -> str:
    store.save_lesson(Lesson(lesson_id=lesson_id, path_id=path_id, title=lesson_id, order=1))
    seg_id = f"{lesson_id}#s0"
    store.save_segment(Segment(seg_id=seg_id, lesson_id=lesson_id, start=0, end=len(text), text=text))
    return seg_id


def _capsule(lesson_id: str, seg_id: str, concepts: list[tuple[str, str, tuple[str, ...]]]) -> LessonCapsule:
    """Build a capsule citing *seg_id*; each concept = (name, excerpt, prereqs).

    ``excerpt`` must be a verbatim substring of the segment text (grounding
    invariant enforced by ``write_capsule_graph``).
    """
    extractions = tuple(
        ConceptExtraction(
            name=name,
            status="introduced",
            prerequisites=prereqs,
            citations=(Citation(seg_id=seg_id, excerpt=excerpt, confidence=0.9),),
        )
        for name, excerpt, prereqs in concepts
    )
    content = LessonContent(lesson_id=lesson_id, concepts=extractions)
    timeline = (
        TopicSpan(lesson_id=lesson_id, topic="Intro", seg_ids=(seg_id,), start=0, end=1),
    )
    return LessonCapsule(lesson_id=lesson_id, timeline=timeline, content=content)


def _signal_store() -> SQLiteStore:
    """Teacher t1 teaches the full Segnale→Fourier→Spettro chain (3 lessons).

    Teacher t2 teaches the SAME concept names in one lesson, so the GLOBAL
    served method graph merges them by canonical key — yet t1's retrieval must
    never surface t2's lesson.
    """
    store = SQLiteStore(":memory:")
    store.save_path(Path(path_id="p1", title="Corso t1", subject="fisica", teacher_id="t1"))
    store.save_path(Path(path_id="p2", title="Corso t2", subject="fisica", teacher_id="t2"))

    t1_l1 = _save_lesson(
        store, path_id="p1", lesson_id="l1",
        text="In questa lezione il Segnale e la Funzione sono le fondamenta del corso.",
    )
    t1_l2 = _save_lesson(
        store, path_id="p1", lesson_id="l2",
        text="La Trasformata di Fourier si costruisce a partire dal segnale e dalla funzione.",
    )
    t1_l3 = _save_lesson(
        store, path_id="p1", lesson_id="l3",
        text="Lo Spettro e il Sistema LTI derivano dalla trasformata di Fourier applicata.",
    )
    # t2: identical concept names, isolated corpus (different lesson/segment).
    t2_l4 = _save_lesson(
        store, path_id="p2", lesson_id="l4",
        text="Anche qui lo Spettro nasce dalla Trasformata di Fourier del segnale.",
    )

    write_capsule_graph(store, _capsule("l1", t1_l1, [
        ("Segnale", "Segnale", ()),
        ("Funzione", "Funzione", ()),
    ]))
    write_capsule_graph(store, _capsule("l2", t1_l2, [
        ("Trasformata di Fourier", "Trasformata di Fourier", ("Segnale", "Funzione")),
    ]))
    write_capsule_graph(store, _capsule("l3", t1_l3, [
        ("Spettro", "Spettro", ("Trasformata di Fourier",)),
        ("Sistema LTI", "Sistema LTI", ("Trasformata di Fourier",)),
    ]))
    write_capsule_graph(store, _capsule("l4", t2_l4, [
        ("Spettro", "Spettro", ("Trasformata di Fourier",)),
        ("Trasformata di Fourier", "Trasformata di Fourier", ()),
    ]))
    return store


class TestMethodGraphRetrievalIntegration:
    def test_selection_runs_on_real_served_graph(self) -> None:
        """The bridge chosen for 'Spettro' is its Fourier prerequisite, picked
        from the ACTUAL served graph (real betweenness), not a hand-built one."""
        store = _signal_store()
        served = serve_method_graph(store)
        out = expand_query_with_bridges("Spettro", served)
        # Fourier is the unique neighbour of Spettro in the persisted graph.
        assert out.matched_concepts == (canonical_match_key("Spettro"),)
        assert out.bridge_terms == ("Trasformata di Fourier",)

    def test_expansion_surfaces_prerequisite_lesson(self) -> None:
        """Bare 'Spettro' misses the Fourier prerequisite lesson; bridge
        expansion surfaces it via the Fourier bridge specifically — the
        milestone's retrieval VALUE.

        The fixture pins WHICH bridge does the work: l2's text shares tokens
        with the leaf concepts too, so 'l2 surfaces' alone is not enough — we
        also assert the only appended term is the central Fourier prerequisite,
        so a mutation that appended a leaf instead would change ``bridge_terms``
        and fail here.
        """
        store = _signal_store()

        bare = retrieve_teacher_context(store, "t1", "Spettro")
        bare_lessons = {h.lesson_id for h in bare}

        expanded = retrieve_teacher_context_with_bridges(store, "t1", "Spettro")
        assert expanded  # non-vacuous: real hits, not an empty list
        expanded_lessons = {h.lesson_id for h in expanded}

        # The prerequisite (Fourier) lesson is absent bare, present expanded.
        assert "l2" not in bare_lessons
        assert "l2" in expanded_lessons
        # The directly-matched lesson is retained either way.
        assert "l3" in bare_lessons and "l3" in expanded_lessons
        # And it was the Fourier BRIDGE that pulled l2 in, not a leaf concept.
        assert expanded[0].metadata["bridge_terms"] == ("Trasformata di Fourier",)

    def test_expansion_never_leaks_other_teacher(self) -> None:
        """Even though t2 teaches identical concepts, t1's expanded retrieval
        stays inside t1's lessons (CRM boundary, global graph notwithstanding)."""
        store = _signal_store()
        expanded = retrieve_teacher_context_with_bridges(store, "t1", "Spettro")
        assert expanded  # must actually return hits, else the bound is vacuous
        lessons = {h.lesson_id for h in expanded}
        assert lessons <= {"l1", "l2", "l3"}
        assert "l4" not in lessons
        assert all(h.match_type == "hybrid" for h in expanded)

    def test_operator_like_bridge_label_does_not_break_retrieval(self) -> None:
        """A bridge label that is an FTS5 operator/special token degrades only
        its own pass — the anchor query's hits are never lost or errored.

        Regression guard for the multi-pass design: were the bridge term
        concatenated into the anchor's FTS5 MATCH, ``C++``/``AND`` would raise a
        syntax error and silently drop BM25 entirely.
        """
        store = _signal_store()
        # A hand-built graph whose bridge label is FTS5-hostile.
        spettro = canonical_match_key("Spettro")
        hostile = MethodGraph(
            concepts=(
                MethodConcept(key=spettro, label="Spettro", node_ids=()),
                MethodConcept(key="cpp", label="C++ AND OR", node_ids=()),
            ),
            dependencies=(
                MethodDependency(source_key=spettro, target_key="cpp", provenance=None, confidence=None),
            ),
            bridges=(
                BridgeConcept(name="C++ AND OR", key="cpp", centrality=0.9, node_ids=()),
                BridgeConcept(name="Spettro", key=spettro, centrality=0.0, node_ids=()),
            ),
        )
        out = retrieve_teacher_context_with_bridges(
            store, "t1", "Spettro", method_graph=hostile
        )
        # The anchor lesson still comes back (no crash, no BM25 wipe-out).
        assert {h.lesson_id for h in out} >= {"l3"}
        assert out[0].metadata["bridge_terms"] == ("C++ AND OR",)

    def test_explicit_method_graph_is_reused(self) -> None:
        """Passing a method_graph skips re-serving and still expands."""
        store = _signal_store()
        # An empty graph cannot expand → result equals the bare query's.
        empty = MethodGraph(concepts=(), dependencies=(), bridges=())
        with_empty = retrieve_teacher_context_with_bridges(
            store, "t1", "Spettro", method_graph=empty
        )
        bare = retrieve_teacher_context(store, "t1", "Spettro")
        assert [h.source_id for h in with_empty] == [h.source_id for h in bare]

    def test_no_match_query_equals_bare_retrieval(self) -> None:
        store = _signal_store()
        expanded = retrieve_teacher_context_with_bridges(store, "t1", "argomento ignoto")
        bare = retrieve_teacher_context(store, "t1", "argomento ignoto")
        assert [h.source_id for h in expanded] == [h.source_id for h in bare]

    def test_centrality_discriminates_neighbours_on_served_graph(self) -> None:
        """When an anchor has a bridge neighbour AND a leaf neighbour, the REAL
        served betweenness picks the bridge first (closes the hand-built gap)."""
        store = SQLiteStore(":memory:")
        store.save_path(Path(path_id="px", title="C", subject="s", teacher_id="tx"))
        a = _save_lesson(store, path_id="px", lesson_id="la", text="La Base e il Lato sono concetti iniziali.")
        b = _save_lesson(store, path_id="px", lesson_id="lb", text="Il Ponte poggia sulla Base.")
        c = _save_lesson(store, path_id="px", lesson_id="lc", text="La Cima usa il Ponte e il Lato.")
        d = _save_lesson(store, path_id="px", lesson_id="ld", text="Il Finale richiede il Ponte.")
        write_capsule_graph(store, _capsule("la", a, [("Base", "Base", ()), ("Lato", "Lato", ())]))
        write_capsule_graph(store, _capsule("lb", b, [("Ponte", "Ponte", ("Base",))]))
        write_capsule_graph(store, _capsule("lc", c, [("Cima", "Cima", ("Ponte", "Lato"))]))
        write_capsule_graph(store, _capsule("ld", d, [("Finale", "Finale", ("Ponte",))]))

        served = serve_method_graph(store)
        centrality = {b.key: b.centrality for b in served.bridges}
        # Ponte is the articulation point (Base ← Ponte ← {Cima,Finale}); Lato is a leaf.
        assert centrality[canonical_match_key("Ponte")] > centrality[canonical_match_key("Lato")]

        out = expand_query_with_bridges("ripasso della Cima", served, max_bridges=1)
        assert out.bridge_terms == ("Ponte",)
