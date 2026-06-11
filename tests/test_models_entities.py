import dataclasses
import json
from pathlib import Path as FsPath

import pytest

from lessonos.models import (
    CONCEPT_STATUS,
    EDGE_TYPES,
    Concept,
    Exercise,
    GraphEdge,
    GraphNode,
    LearningDebtItem,
    Lesson,
    Moment,
    Path,
    Source,
)

FIXTURE_DIR = FsPath(__file__).resolve().parent.parent / "fixtures" / "sample_path"


def test_edge_types_match_plan_vocab_exactly() -> None:
    # PLAN §3.2 / §14.2 — pinned so the model can't silently drift from spec.
    assert EDGE_TYPES == frozenset(
        {
            "explains",
            "depends_on",
            "revises",
            "contradicts",
            "repeats",
            "exemplifies",
            "assesses",
            "derived_from",
            "assigned_in",
            "resolved_by",
            "prepares",
        }
    )


def test_concept_status_vocab_matches_plan() -> None:
    # PLAN §26.1 + M1-1 'mastered' — added for path-level status progression.
    assert CONCEPT_STATUS == frozenset(
        {"introduced", "reinforced", "reviewed", "problematic", "mastered"}
    )


def test_graph_edge_rejects_unknown_edge_type() -> None:
    with pytest.raises(ValueError):
        GraphEdge("e1", "n1", "n2", "teleports")


def test_graph_edge_accepts_valid_edge_type() -> None:
    edge = GraphEdge("e1", "n_concept", "n_lesson", "explains")
    assert edge.edge_type == "explains"
    assert edge.source == "n_concept" and edge.target == "n_lesson"


def test_concept_rejects_unknown_status() -> None:
    with pytest.raises(ValueError):
        Concept("c1", "derivata", status="unknown")


def test_concept_accepts_valid_status() -> None:
    c = Concept("c1", "derivata", status="introduced", prerequisites=("limite",))
    assert c.status == "introduced"
    assert c.prerequisites == ("limite",)


def test_entities_are_frozen() -> None:
    lesson = Lesson("l1", "p1", "Intro", order=1)
    with pytest.raises(dataclasses.FrozenInstanceError):
        lesson.title = "changed"  # type: ignore[misc]


def test_all_entities_construct_with_minimal_fields() -> None:
    Source("calculus_primer", "Calculus primer")
    Moment("m1", "l1", t=115, kind="marker_important", seg_id="l1s3")
    Exercise("ex1", "l1", prompt="Calcola f'(x) per f(x)=x^2")
    LearningDebtItem("d1", "p1", kind="open_doubt", description="limite non chiaro")
    GraphNode("n1", node_type="concept", ref_id="c1")


def test_path_and_lesson_roundtrip_real_fixture() -> None:
    # Grounded: the dataclasses must hold the actual synthetic fixture data,
    # not invented values.
    path_raw = json.loads((FIXTURE_DIR / "path.json").read_text())
    path = Path(
        path_id=path_raw["path_id"],
        title=path_raw["title"],
        subject=path_raw["subject"],
        lesson_ids=tuple(path_raw["lessons"]),
        source_ids=tuple(path_raw["sources"]),
        synthetic=path_raw["synthetic"],
    )
    assert path.path_id == "path_calc_101"
    assert path.synthetic is True
    assert "l1_derivative_definition" in path.lesson_ids

    lesson_raw = json.loads(
        (FIXTURE_DIR / "lessons" / "l1_derivative_definition.json").read_text()
    )
    lesson = Lesson(
        lesson_id=lesson_raw["lesson_id"],
        path_id=lesson_raw["path_id"],
        title=lesson_raw["title"],
        order=lesson_raw["order"],
        source_id=lesson_raw["source_id"],
    )
    assert lesson.path_id == path.path_id
    assert lesson.lesson_id in path.lesson_ids
    assert lesson.order == 1
