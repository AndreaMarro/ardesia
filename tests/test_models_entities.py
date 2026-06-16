import dataclasses
import json
from pathlib import Path as FsPath

import pytest

from lessonos.models import (
    CONCEPT_STATUS,
    EDGE_TYPES,
    AggregatedPathNode,
    Concept,
    Exercise,
    GraphEdge,
    GraphNode,
    LearningDebtItem,
    Lesson,
    Moment,
    Path,
    Source,
    validate_enum,
)
from lessonos.models.entities import TeacherConcept

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


class TestValidateEnum:
    """Shared controlled-vocabulary validator (dedup of 6 call sites)."""

    def test_accepts_member_silently(self) -> None:
        assert validate_enum("explains", EDGE_TYPES, "edge_type") is None

    def test_rejects_non_member_with_value_label_and_sorted_options(self) -> None:
        with pytest.raises(ValueError) as exc:
            validate_enum("teleports", EDGE_TYPES, "edge_type")
        msg = str(exc.value)
        # value is repr'd, label verbatim, options sorted — pins the whole shape
        assert msg == (
            "invalid edge_type: 'teleports' "
            f"(expected one of {sorted(EDGE_TYPES)})"
        )

    def test_options_are_sorted_not_frozenset_order(self) -> None:
        # frozenset iteration order is unspecified; the message must be sorted.
        with pytest.raises(ValueError, match=r"\['introduced', 'mastered'"):
            validate_enum("x", CONCEPT_STATUS, "concept status")


class TestEntityValidatorLabels:
    """Each entity routes through validate_enum with its OWN label.

    Mutation guard: swapping any call-site label flips the asserted substring.
    """

    def test_concept_label(self) -> None:
        with pytest.raises(ValueError, match=r"^invalid concept status: 'bad'"):
            Concept("c1", "derivata", status="bad")

    def test_graph_edge_label(self) -> None:
        with pytest.raises(ValueError, match=r"^invalid edge_type: 'bad'"):
            GraphEdge("e1", "n1", "n2", "bad")

    def test_aggregated_path_node_label(self) -> None:
        with pytest.raises(
            ValueError, match=r"^invalid aggregated concept status: 'bad'"
        ):
            AggregatedPathNode("n1", label="L", status="bad")

    def test_teacher_concept_label(self) -> None:
        with pytest.raises(
            ValueError, match=r"^invalid teacher concept status: 'bad'"
        ):
            TeacherConcept(name="Energia", canonical="energia", status="bad")

    def test_valid_status_constructs_each(self) -> None:
        # The happy path still passes for the two previously-untested entities.
        assert AggregatedPathNode("n1", label="L", status="introduced").status == (
            "introduced"
        )
        assert TeacherConcept(
            name="E", canonical="e", status="mastered"
        ).status == "mastered"
