"""Tests for TeacherBook builder (M1-2a, lessonos/teacher_book.py).

Tests cover:
- Basic TeacherBook structure from a single teacher with multiple lessons
- Fundamental concepts ranked by evidence/edge count
- Problematic concepts filtered correctly
- Status progression across lessons
- Prerequisite chains from depends_on edges
- Unknown teacher → ValueError
- Empty graph (teacher with no capsules) → empty book with no crash
"""

import json

from lessonos.capsule.assembly import _serialise_capsule, LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.models.entities import (
    Segment,
    GraphEdge,
    GraphEvidence,
    GraphNode,
    Lesson,
    Path,
)
from lessonos.store.base import Store
from lessonos.teacher_book import build_teacher_book


# ---------------------------------------------------------------------------
# Minimal in-memory Store stub (same pattern as test_graph_aggregator)
# ---------------------------------------------------------------------------


class _BookStore(Store):
    """Minimal in-memory store stub for teacher book tests."""

    def __init__(self):
        self._paths: dict[str, Path] = {}
        self._lessons: dict[str, Lesson] = {}
        self._capsules: dict[str, str] = {}
        self._nodes: dict[str, list[GraphNode]] = {}
        self._edges: dict[str, list[GraphEdge]] = {}
        self._evidence: dict[str, list[GraphEvidence]] = {}
        self._segments: dict[str, object] = {}

    def save_path(self, p: Path) -> None:
        self._paths[p.path_id] = p

    def get_path(self, path_id: str) -> Path | None:
        return self._paths.get(path_id)

    def paths_for_teacher(self, teacher_id: str) -> tuple[Path, ...]:
        return tuple(
            p for p in self._paths.values() if p.teacher_id == teacher_id
        )

    def save_lesson(self, l: Lesson) -> None:
        self._lessons[l.lesson_id] = l

    def get_lesson(self, lesson_id: str) -> Lesson | None:
        return self._lessons.get(lesson_id)

    def lessons_for_path(self, path_id: str) -> tuple[Lesson, ...]:
        return tuple(
            l for l in self._lessons.values() if l.path_id == path_id
        )

    def save_capsule(self, lesson_id: str, data: str) -> None:
        self._capsules[lesson_id] = data

    def get_capsule(self, lesson_id: str) -> str | None:
        return self._capsules.get(lesson_id)

    def save_segment(self, seg) -> None:
        self._segments[seg.seg_id] = seg

    def get_segment(self, seg_id: str):
        return self._segments.get(seg_id)

    def segments_for_lesson(self, lid: str):
        return tuple(s for s in self._segments.values()
                     if getattr(s, 'lesson_id', None) == lid)

    # Graph tables
    def save_graph_node(self, lesson_id: str, node: GraphNode) -> None:
        self._nodes.setdefault(lesson_id, []).append(node)

    def get_graph_nodes_for_lesson(self, lesson_id: str) -> tuple[GraphNode, ...]:
        return tuple(self._nodes.get(lesson_id, []))

    def save_graph_edge(self, lesson_id: str, edge: GraphEdge) -> None:
        self._edges.setdefault(lesson_id, []).append(edge)

    def get_graph_edges_for_lesson(self, lesson_id: str) -> tuple[GraphEdge, ...]:
        return tuple(self._edges.get(lesson_id, []))

    def save_evidence(self, evidence: GraphEvidence) -> None:
        self._evidence.setdefault(evidence.lesson_id, []).append(evidence)

    def get_evidence_for_edge(self, edge_id: str) -> tuple[GraphEvidence, ...]:
        result: list[GraphEvidence] = []
        for lst in self._evidence.values():
            for ev in lst:
                if ev.edge_id == edge_id:
                    result.append(ev)
        return tuple(result)

    def get_all_evidence_for_lesson(self, lesson_id: str) -> tuple[GraphEvidence, ...]:
        return tuple(self._evidence.get(lesson_id, []))

    def delete_graph_for_lesson(self, lesson_id: str) -> None:
        self._nodes.pop(lesson_id, None)
        self._edges.pop(lesson_id, None)
        self._evidence.pop(lesson_id, None)

    # Unused abstract method stubs
    def save_source(self, *a, **kw): ...
    def get_source(self, *a, **kw): ...
    def save_moment(self, *a, **kw): ...
    def get_moment(self, *a, **kw): ...
    def moments_for_lesson(self, *a, **kw): ...
    def save_ledger_entry(self, *a, **kw): ...
    def get_ledger_entries(self, *a, **kw): ...
    def get_ledger_for_lesson(self, *a, **kw): ...
    def close(self): ...
    def begin_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...


# ---------------------------------------------------------------------------
# Fixture helpers
# ---------------------------------------------------------------------------


def _make_capsule(
    lesson_id: str,
    concepts: list[dict],
) -> LessonCapsule:
    """Build a LessonCapsule from a list of concept dicts."""
    extracted_concepts = []
    for c in concepts:
        cit = []
        for c_ref in c.get("citations", []):
            cit.append(Citation(
                seg_id=c_ref["seg_id"],
                excerpt=c_ref.get("excerpt"),
                confidence=c_ref.get("confidence"),
            ))
        extracted_concepts.append(ConceptExtraction(
            name=c["name"],
            status=c["status"],
            canonical=c.get("canonical", ""),
            prerequisites=tuple(c.get("prerequisites", [])),
            citations=tuple(cit),
        ))

    content = LessonContent(
        lesson_id=lesson_id,
        concepts=tuple(extracted_concepts),
    )

    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=(),
        content=content,
    )


def _setup_teacher_store(
    teacher_id: str = "prof_mario",
    path_id: str = "fisica1",
    lesson_ids: list[str] | None = None,
) -> _BookStore:
    """Set up a store with a teacher, path, and lessons.

    Returns a pre-populated store ready for ``build_teacher_book``.
    Lessons have no capsules unless added separately via ``_save_capsule``.
    """
    store = _BookStore()
    if lesson_ids is None:
        lesson_ids = ["l1", "l2"]

    path = Path(
        path_id=path_id,
        title="Fisica 1",
        subject="Fisica",
        lesson_ids=tuple(lesson_ids),
        teacher_id=teacher_id,
    )
    store.save_path(path)

    for i, lid in enumerate(lesson_ids):
        store.save_lesson(Lesson(
            lesson_id=lid,
            path_id=path_id,
            title=f"Lezione {i+1}",
            order=i + 1,
        ))

    return store


def _save_capsule(
    store: _BookStore,
    lesson_id: str,
    concepts: list[dict],
) -> None:
    """Save a capsule with given concepts to the store."""
    capsule = _make_capsule(lesson_id, concepts)
    raw = _serialise_capsule(capsule)
    store.save_capsule(lesson_id, raw)

    # Also save graph nodes/edges/evidence for the lesson
    for idx, c in enumerate(concepts):
        node_id = f"{lesson_id}:concept:{idx}"
        store.save_graph_node(lesson_id, GraphNode(
            node_id=node_id,
            node_type="concept",
            ref_id=node_id,
            label=c["name"],
        ))


def _add_edge(
    store: _BookStore,
    lesson_id: str,
    source: str,
    target: str,
    edge_type: str,
    edge_id: str,
    evidence_list: list[dict] | None = None,
) -> None:
    """Add a graph edge with optional evidence."""
    edge = GraphEdge(
        edge_id=edge_id,
        source=source,
        target=target,
        edge_type=edge_type,
    )
    store.save_graph_edge(lesson_id, edge)

    if evidence_list:
        for i, ev in enumerate(evidence_list):
            store.save_evidence(GraphEvidence(
                evidence_id=f"{edge_id}#ev{i}",
                edge_id=edge_id,
                seg_id=ev["seg_id"],
                excerpt=ev.get("excerpt"),
                lesson_id=lesson_id,
            ))
            # Fixture onesta (bug-hunt #1b): segmento di supporto reale.
            if store.get_segment(ev["seg_id"]) is None:
                store.save_segment(Segment(
                    seg_id=ev["seg_id"], lesson_id=lesson_id, start=0, end=1,
                    text=(ev.get("excerpt") or "testo di supporto fixture") + " — contesto.",
                ))


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestTeacherBookBasic:
    """Basic structural tests for TeacherBook output."""

    def test_single_teacher_two_lessons(self):
        """Two lessons with same concepts should produce a proper TeacherBook."""
        store = _setup_teacher_store()
        # l1: 3 concepts
        _save_capsule(store, "l1", [
            {"name": "Vettori", "status": "introduced", "canonical": "vettore",
             "citations": [{"seg_id": "l1#s0"}]},
            {"name": "Forze", "status": "introduced", "canonical": "forza",
             "citations": [{"seg_id": "l1#s1"}]},
            {"name": "Massa", "status": "introduced", "canonical": "massa"},
        ])
        # l2: same canonical concepts with progression
        _save_capsule(store, "l2", [
            {"name": "Vettori nello spazio", "status": "reinforced", "canonical": "vettore",
             "citations": [{"seg_id": "l2#s0"}, {"seg_id": "l2#s3"}]},
            {"name": "Forze di attrito", "status": "reinforced", "canonical": "forza",
             "citations": [{"seg_id": "l2#s1"}]},
            {"name": "Energia", "status": "introduced", "canonical": "energia"},
        ])
        # Add edges
        _add_edge(store, "l1", "l1:concept:0", "l1:concept:1", "explains",
                  "e1", [{"seg_id": "l1#s0", "excerpt": "vettori"}])

        book = build_teacher_book(store, "prof_mario")

        assert book.teacher_id == "prof_mario"
        assert book.total_concepts == 4  # 4 unique canonical concepts (vettore, forza, massa, energia)
        assert book.total_lessons == 2
        assert book.total_edges == 1
        assert book.total_evidence == 1

    def test_teacher_not_found_raises(self):
        """Unknown teacher should raise ValueError."""
        store = _BookStore()
        store.save_path(Path(
            path_id="p1", title="Test", subject="X",
            lesson_ids=("l1",), teacher_id="altra",
        ))
        try:
            build_teacher_book(store, "sconosciuto")
            assert False, "expected ValueError"
        except ValueError:
            pass

    def test_empty_graph_no_crash(self):
        """Teacher with path but no capsules → empty book (no crash)."""
        store = _setup_teacher_store(lesson_ids=["l1", "l2"])
        book = build_teacher_book(store, "prof_mario")

        assert book.total_concepts == 0
        assert book.total_lessons == 0
        assert book.fundamental_concepts == ()

    def test_single_lesson_no_graph(self):
        """Single lesson with concepts but no graph edges."""
        store = _setup_teacher_store(lesson_ids=["l1"])
        _save_capsule(store, "l1", [
            {"name": "Energia cinetica", "status": "introduced", "canonical": "energia"},
            {"name": "Lavoro", "status": "introduced", "canonical": "lavoro"},
        ])

        book = build_teacher_book(store, "prof_mario")

        assert book.total_concepts == 2
        assert book.total_edges == 0
        assert len(book.fundamental_concepts) == 2
        assert len(book.problematic_concepts) == 0


class TestTeacherBookSections:
    """Tests for specific TeacherBook section content."""

    def test_fundamental_concepts_ranked(self):
        """Concepts with more evidence should rank higher."""
        store = _setup_teacher_store(lesson_ids=["l1"])
        _save_capsule(store, "l1", [
            {"name": "Principale", "status": "introduced", "canonical": "principale",
             "citations": [
                 {"seg_id": "l1#s0"},
                 {"seg_id": "l1#s1"},
                 {"seg_id": "l1#s2"},
             ]},
            {"name": "Secondario", "status": "introduced", "canonical": "secondario",
             "citations": [{"seg_id": "l1#s3"}]},
        ])
        _add_edge(store, "l1", "l1:concept:0", "l1:concept:1", "explains",
                  "e1", [{"seg_id": "l1#s0", "excerpt": "principale spiega"}])

        book = build_teacher_book(store, "prof_mario")

        assert len(book.fundamental_concepts) == 2
        # "Principale" has 3 citations vs "Secondario" has 1
        assert book.fundamental_concepts[0].name == "Principale"
        assert book.fundamental_concepts[0].evidence_count == 3
        assert book.fundamental_concepts[1].evidence_count == 1

    def test_problematic_concepts_filtered(self):
        """Concepts with status='problematic' appear in problematic section."""
        store = _setup_teacher_store(lesson_ids=["l1"])
        _save_capsule(store, "l1", [
            {"name": "Facile", "status": "introduced", "canonical": "facile"},
            {"name": "Difficile", "status": "problematic", "canonical": "difficile"},
            {"name": "OK", "status": "mastered", "canonical": "ok"},
        ])

        book = build_teacher_book(store, "prof_mario")

        assert len(book.problematic_concepts) == 1
        assert book.problematic_concepts[0].name == "Difficile"
        assert book.problematic_concepts[0].status == "problematic"

    def test_status_progression(self):
        """Concepts appearing in multiple lessons show progression."""
        store = _setup_teacher_store(lesson_ids=["l1", "l2"])
        _save_capsule(store, "l1", [
            {"name": "Vettori", "status": "introduced", "canonical": "vettore"},
        ])
        _save_capsule(store, "l2", [
            {"name": "Vettori nello spazio", "status": "reinforced", "canonical": "vettore"},
        ])

        book = build_teacher_book(store, "prof_mario")

        # Should find progression for "Vettori"
        prog = [p for p in book.progression
                if p.canonical == "vettore" or p.name == "Vettori"]
        assert len(prog) == 1
        if prog:
            p = prog[0]
            assert "introduced" in p.status_sequence
            assert "reinforced" in p.status_sequence

    def test_prerequisite_chains(self):
        """depends_on edges produce PrerequisiteChain entries."""
        store = _setup_teacher_store(lesson_ids=["l1"])
        _save_capsule(store, "l1", [
            {"name": "Vettori", "status": "introduced", "canonical": "vettore"},
            {"name": "Forze", "status": "introduced", "canonical": "forza",
             "prerequisites": ["vettore"]},
        ])
        # depends_on edge: Forze depends_on Vettori
        _add_edge(store, "l1", "l1:concept:0", "l1:concept:1", "depends_on",
                  "e1", [{"seg_id": "l1#s0", "excerpt": "vettori"}])

        book = build_teacher_book(store, "prof_mario")

        # The depends_on edge should appear as a prerequisite chain
        # (target depends on source — so "Forze" depends on "Vettori")
        assert len(book.prerequisites) > 0
        # Find the chain for "Forze" (the target)
        forze_chain = [c for c in book.prerequisites if "Forze" in c.concept]
        assert len(forze_chain) == 1

    def test_multi_path_teacher_aggregation(self):
        """Teacher with two paths should aggregate across both."""
        store = _BookStore()
        path1 = Path(
            path_id="fisica1", title="Fisica 1", subject="Fisica",
            lesson_ids=("l1",), teacher_id="prof_mario",
        )
        path2 = Path(
            path_id="fisica2", title="Fisica 2", subject="Fisica",
            lesson_ids=("l2",), teacher_id="prof_mario",
        )
        store.save_path(path1)
        store.save_path(path2)
        for p, lid in [(path1, "l1"), (path2, "l2")]:
            store.save_lesson(Lesson(
                lesson_id=lid, path_id=p.path_id,
                title=f"Lezione {lid}", order=1,
            ))

        _save_capsule(store, "l1", [
            {"name": "Vettori", "status": "introduced", "canonical": "vettore"},
        ])
        _save_capsule(store, "l2", [
            {"name": "Vettori 2D", "status": "reinforced", "canonical": "vettore"},
        ])

        book = build_teacher_book(store, "prof_mario")

        assert book.total_concepts == 1  # "vettore" canonical merged
        assert book.total_lessons == 2
