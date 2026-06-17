"""GS-3 — persisted cross-lesson depends_on at INGEST time.

Two layers:

1. ``resolve_corpus_depends_on`` — pure resolver, tested on a LABELLED
   precision set (positives + negatives). One wrong match = RED. This is the
   ZERO-false-match hard constraint of the pin, isolated from any I/O.

2. ``write_capsule_graph`` end-to-end with a real ``SQLiteStore``: ingesting a
   lesson canonicalises its prerequisites against concepts ALREADY PERSISTED
   from prior lessons and writes ``depends_on`` edges with provenance +
   confidence — additive, migrate-safe (no schema change).
"""

from __future__ import annotations

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    LessonContent,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.graph.builder import resolve_corpus_depends_on
from lessonos.graph.writer import write_capsule_graph
from lessonos.store.sqlite import SCHEMA_VERSION, SQLiteStore
from lessonos.models.entities import Segment


# ===================================================================
# 1. Pure resolver — labelled precision set (ZERO false matches)
# ===================================================================


def _corpus() -> list[tuple[str, str]]:
    """Existing corpus concepts: (node_id, canonical name)."""
    return [
        ("l1:concept:0", "Trasformata di Fourier"),
        ("l1:concept:1", "Sistema LTI"),
        ("l1:concept:2", "Trasformata di Laplace"),
        ("l2:concept:0", "Equazione Differenziale Ordinaria"),
        ("l2:concept:1", "Funzione Periodica"),
    ]


class TestResolverPrecision:
    def test_exact_and_fuzzy_positives_only(self):
        """The EXACT set of resolved edges on a labelled fixture.

        Positives: exact canonical ("sistema lti" → "Sistema LTI") and the
        article/word-order fuzzy variant ("la trasformata di Fourier" →
        "Trasformata di Fourier", Jaccard 1.0). Every other prereq is a
        deliberate NEGATIVE that must NOT produce an edge:
          - "fourier"                     subset (J=0.5)  → drop
          - "trasformata"                 tie Fourier/Laplace → drop
          - "equazione differenziale"     subset of EDO (J<1) → drop
          - "trasformata di hilbert"      absent → drop
        """
        source = [
            (
                "l3:concept:0",
                "Filtro",
                (
                    "sistema lti",                 # exact (case)
                    "la trasformata di Fourier",   # fuzzy article variant
                    "fourier",                     # subset → reject
                    "trasformata",                 # tie → reject
                    "equazione differenziale",     # subset → reject
                    "trasformata di hilbert",      # absent → reject
                ),
            ),
        ]
        edges = resolve_corpus_depends_on(source, _corpus(), [])
        got = {(e.source, e.target) for e in edges}
        assert got == {
            ("l3:concept:0", "l1:concept:1"),  # Sistema LTI (exact)
            ("l3:concept:0", "l1:concept:0"),  # Trasformata di Fourier (fuzzy)
        }

    def test_provenance_and_confidence(self):
        source = [("l3:concept:0", "Filtro", ("sistema lti", "la trasformata di Fourier"))]
        edges = resolve_corpus_depends_on(source, _corpus(), [])
        by_target = {e.target: e for e in edges}
        exact = by_target["l1:concept:1"]
        assert exact.metadata == {
            "provenance": "auto-suggested",
            "confidence": "0.8",
            "prereq": "sistema lti",
        }
        fuzzy = by_target["l1:concept:0"]
        assert fuzzy.metadata == {
            "provenance": "auto-suggested-fuzzy",
            "confidence": "1.00",
            "prereq": "la trasformata di Fourier",
        }

    def test_superset_prereq_is_not_matched(self):
        """A prereq broader than any concept (superset) is rejected (J<1)."""
        source = [("l3:concept:0", "X", ("equazione differenziale ordinaria lineare",))]
        edges = resolve_corpus_depends_on(source, _corpus(), [])
        assert edges == []

    def test_self_dependency_skipped(self):
        """A concept whose prereq resolves to itself produces no edge."""
        source = [("l1:concept:0", "Trasformata di Fourier", ("la trasformata di Fourier",))]
        edges = resolve_corpus_depends_on(source, _corpus(), [])
        assert edges == []

    def test_empty_prereqs_no_edges(self):
        source = [("l3:concept:0", "Filtro", ())]
        assert resolve_corpus_depends_on(source, _corpus(), []) == []

    def test_cycle_closing_edge_dropped(self):
        """An edge that would close a cycle with the persisted graph is dropped.

        Persisted: Sistema LTI depends_on Filtro (l1:c1 → l3:c0). Ingesting
        Filtro with prereq "sistema lti" would add l3:c0 → l1:c1, closing a
        2-cycle. The guard drops it.
        """
        existing = [("l1:concept:1", "l3:concept:0")]
        corpus = _corpus() + [("l3:concept:0", "Filtro")]
        source = [("l3:concept:0", "Filtro", ("sistema lti",))]
        edges = resolve_corpus_depends_on(source, corpus, existing)
        assert edges == []

    def test_duplicate_prereq_yields_single_edge(self):
        source = [("l3:concept:0", "Filtro", ("sistema lti", "sistema LTI"))]
        edges = resolve_corpus_depends_on(source, _corpus(), [])
        assert len(edges) == 1
        assert edges[0].edge_id == "l3:concept:0-depends_on->l1:concept:1"


# ===================================================================
# 2. End-to-end persistence via write_capsule_graph + SQLiteStore
# ===================================================================


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
    lesson_id: str,
    concepts: list[tuple[str, tuple[str, ...]]],
) -> LessonCapsule:
    """Build a grounded capsule; each concept cites its own lesson's seg i."""
    extractions = []
    for i, (name, prereqs) in enumerate(concepts):
        seg_id = _seg_id(lesson_id, i)
        text = f"Segment {i} of {lesson_id}: a real sentence long enough to cite."
        extractions.append(
            ConceptExtraction(
                name=name,
                status="introduced",
                prerequisites=prereqs,
                citations=(Citation(seg_id=seg_id, excerpt=text[:20], confidence=0.9),),
            )
        )
    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(extractions),
        exercises=(),
        student_questions=(),
        homework=(),
    )
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


def _depends_on(store: SQLiteStore, lesson_id: str) -> list[tuple[str, str]]:
    return [
        (e.source, e.target)
        for e in store.get_graph_edges_for_lesson(lesson_id)
        if e.edge_type == "depends_on"
    ]


class TestPersistedDependsOn:
    def test_no_corpus_no_depends_on(self):
        """First lesson ingested: nothing to depend on yet."""
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 3)
        write_capsule_graph(
            store,
            _capsule(
                "l1",
                [
                    ("Trasformata di Fourier", ()),
                    ("Sistema LTI", ()),
                    ("Spettro", ("la trasformata di Fourier",)),
                ],
            ),
        )
        # within-lesson: Spettro → Trasformata di Fourier (fuzzy)
        assert _depends_on(store, "l1") == [("l1:concept:2", "l1:concept:0")]

    def test_cross_lesson_depends_on_persisted_with_provenance(self):
        """Second lesson's prereqs resolve to the FIRST lesson's concepts."""
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 2)
        _ingest_segments(store, "l2", 2)
        # l1 has no prereqs.
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        before = _depends_on(store, "l2")
        assert before == []  # l2 not ingested yet

        # l2: "Filtro" depends on the exact "Sistema LTI" + fuzzy Fourier.
        write_capsule_graph(
            store,
            _capsule(
                "l2",
                [
                    ("Filtro", ("Sistema LTI", "la trasformata di Fourier")),
                    ("Convoluzione", ("fourier",)),  # subset → reject (zero-false)
                ],
            ),
        )
        edges = {
            e.target: e
            for e in store.get_graph_edges_for_lesson("l2")
            if e.edge_type == "depends_on"
        }
        # +2 cross-lesson edges, the subset negative produced NOTHING.
        assert set(edges) == {"l1:concept:1", "l1:concept:0"}
        assert edges["l1:concept:1"].source == "l2:concept:0"
        assert edges["l1:concept:1"].metadata["provenance"] == "auto-suggested"
        assert edges["l1:concept:0"].metadata["provenance"] == "auto-suggested-fuzzy"
        assert edges["l1:concept:0"].metadata["confidence"] == "1.00"

    def test_reingest_is_idempotent(self):
        """Re-ingesting a lesson reproduces the same depends_on edges."""
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 2)
        _ingest_segments(store, "l2", 1)
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        cap2 = _capsule("l2", [("Filtro", ("Sistema LTI",))])
        write_capsule_graph(store, cap2)
        first = _depends_on(store, "l2")
        write_capsule_graph(store, cap2)
        assert _depends_on(store, "l2") == first == [("l2:concept:0", "l1:concept:1")]

    def test_schema_unchanged_additive(self):
        """GS-3 adds NO schema migration: persistence reuses the edges table."""
        store = SQLiteStore(":memory:")
        version = store._conn.execute("PRAGMA user_version").fetchone()[0]
        assert version == SCHEMA_VERSION  # no bump for GS-3

    def test_before_after_measured(self):
        """Naive exact-.lower count vs canonical+fuzzy persisted count."""
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 2)
        _ingest_segments(store, "l2", 1)
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        # "sistema lti" (exact via fold) + "la trasformata di Fourier" (fuzzy).
        write_capsule_graph(
            store,
            _capsule("l2", [("Filtro", ("sistema lti", "la trasformata di Fourier"))]),
        )
        # Naive exact .lower() would match only "sistema lti" → 1.
        # canonical + fuzzy → 2.
        assert len(_depends_on(store, "l2")) == 2


class TestInboundReconciliation:
    """Positional node_ids + re-ingest reorder must not leave FALSE inbound edges.

    Concept ids are ``{lesson}:concept:{i}``. If a target lesson is re-ingested
    with concepts reordered, an inbound cross-lesson ``depends_on`` (stored under
    the SOURCE lesson, so untouched by the target's own delete) keeps pointing at
    a positional id whose label now means something else. The writer re-validates
    such edges on re-ingest and drops the stale one (zero false matches).
    """

    def test_reorder_drops_stale_inbound_edge(self):
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 2)
        _ingest_segments(store, "l2", 1)
        # l1: c0=Fourier, c1=LTI.
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        # l2 "Filtro" depends on "Sistema LTI" → edge l2:c0 → l1:c1 (LTI).
        write_capsule_graph(store, _capsule("l2", [("Filtro", ("Sistema LTI",))]))
        assert _depends_on(store, "l2") == [("l2:concept:0", "l1:concept:1")]

        # Re-ingest l1 with concepts REORDERED: now c0=LTI, c1=Fourier. The
        # inbound edge still points at l1:concept:1, which now means Fourier.
        write_capsule_graph(
            store,
            _capsule("l1", [("Sistema LTI", ()), ("Trasformata di Fourier", ())]),
        )
        # The stale FALSE edge (now → Fourier) must be gone, NOT silently kept.
        assert ("l2:concept:0", "l1:concept:1") not in _depends_on(store, "l2")
        # Conservative: dropped, not repointed (recreated on l2 re-ingest).
        assert _depends_on(store, "l2") == []

    def test_benign_reingest_keeps_valid_inbound_edge(self):
        """Re-ingesting the target in the SAME order keeps a still-valid edge.

        Guards against over-aggressive dropping (non-tautological vs the test
        above: same machinery, opposite outcome).
        """
        store = SQLiteStore(":memory:")
        _ingest_segments(store, "l1", 2)
        _ingest_segments(store, "l2", 1)
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        write_capsule_graph(store, _capsule("l2", [("Filtro", ("Sistema LTI",))]))
        # Same order: l1:concept:1 still means LTI.
        write_capsule_graph(
            store,
            _capsule("l1", [("Trasformata di Fourier", ()), ("Sistema LTI", ())]),
        )
        assert _depends_on(store, "l2") == [("l2:concept:0", "l1:concept:1")]
