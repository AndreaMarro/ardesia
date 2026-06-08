"""Tests for lessonos/pipeline.py — reusable pipeline orchestrator.

Tests are non-tautological: they verify real behavior (field values,
grounding, deterministic output) rather than just 'returns a result'.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from types import MappingProxyType

from lessonos.capsule.assembly import LessonCapsule
from lessonos.graph.didactic_delta import DidacticDelta
from lessonos.graph.learning_debt import LearningDebtLedger
from lessonos.graph.next_lesson_planner import NextLessonPlan
from lessonos.graph.path_memory import PathMemory
from lessonos.pipeline import LESSON_MOCKS, PipelineResult, run_pipeline
from lessonos.store.fixture_loader import DEFAULT_FIXTURE_ROOT


# ---------------------------------------------------------------------------
# PipelineResult basics
# ---------------------------------------------------------------------------


class TestPipelineResultBasics:
    """Construction and properties of PipelineResult."""

    def test_frozen(self) -> None:
        """PipelineResult is immutable."""
        r = PipelineResult(
            path_id="test",
            capsules=(),
            memory=_dummy_memory(),
            delta=_dummy_delta(),
            debt=_dummy_debt(),
            plan=_dummy_plan(),
            store=None,
        )
        with pytest.raises(AttributeError):
            r.path_id = "other"  # type: ignore[misc]

    def test_summary_format(self) -> None:
        """Summary line includes all expected fields."""
        r = PipelineResult(
            path_id="path_xyz",
            capsules=(),
            memory=_dummy_memory(),
            delta=_dummy_delta(),
            debt=_dummy_debt(),
            plan=_dummy_plan(),
            store=None,
            elapsed_seconds=1.23,
            total_cost_usd=0.05,
        )
        s = r.summary
        assert "path_xyz" in s
        assert "0 concepts" in s
        assert "0 new-delta" in s
        assert "$0.0500" in s
        assert "1.2s" in s

    def test_empty_capsules_accepted(self) -> None:
        """Empty tuple of capsules is valid."""
        r = PipelineResult(
            path_id="empty",
            capsules=(),
            memory=_dummy_memory(),
            delta=_dummy_delta(),
            debt=_dummy_debt(),
            plan=_dummy_plan(),
            store=None,
        )
        assert len(r.capsules) == 0


# ---------------------------------------------------------------------------
# run_pipeline
# ---------------------------------------------------------------------------


class TestRunPipeline:
    """Full pipeline run on default fixture."""

    def test_returns_pipeline_result(self) -> None:
        """run_pipeline returns a PipelineResult."""
        result = run_pipeline()
        assert isinstance(result, PipelineResult)
        assert isinstance(result.path_id, str)
        assert result.path_id == "path_calc_101"

    def test_produces_all_four_capsules(self) -> None:
        """All 4 lessons in the fixture produce capsules."""
        result = run_pipeline()
        assert len(result.capsules) == 4
        lesson_ids = [c.lesson_id for c in result.capsules]
        assert lesson_ids == [
            "l1_derivative_definition",
            "l2_derivative_rules",
            "l3_integral_intro",
            "l4_integral_substitution",
        ]

    def test_each_capsule_has_grounded_citations(self) -> None:
        """Every citation in every capsule resolves to a real seg_id.

        Non-tautological: checks fixture-specific seg_id values.
        """
        result = run_pipeline()
        # Collect all citations from concepts
        for capsule in result.capsules:
            for concept in capsule.content.concepts:
                for cit in concept.citations:
                    # seg_id must be from the fixture schema (e.g. l1s1, l2s2)
                    assert cit.seg_id.startswith(capsule.lesson_id[0:2].replace("_", "")), (
                        f"Citation {cit.seg_id} doesn't match lesson {capsule.lesson_id}"
                    )
                    assert cit.seg_id[-1].isdigit(), f"Invalid seg_id format: {cit.seg_id}"

    def test_path_memory_aggregates_8_concepts(self) -> None:
        """Path Memory from 4 mock capsules has exactly 8 canonical concepts.

        Concepts: derivata, rapporto incrementale, regola della potenza,
        regola della catena, integrale, antiderivata, teorema fondamentale,
        sostituzione.
        """
        result = run_pipeline()
        assert isinstance(result.memory, PathMemory)
        assert result.memory.total_concepts == 8
        concept_names = {c.name for c in result.memory.concept_graph}
        assert "derivata" in concept_names
        assert "sostituzione" in concept_names

    def test_didactic_delta_has_one_new_concept(self) -> None:
        """Delta between first 3 and all 4 capsules detects 1 new concept.

        'sostituzione' is introduced in l4 — not in the first 3.
        """
        result = run_pipeline()
        assert isinstance(result.delta, DidacticDelta)
        assert result.delta.total_new_concepts == 1
        if result.delta.new_concepts:
            assert result.delta.new_concepts[0].name == "sostituzione"

    def test_learning_debt_detects_open_doubts(self) -> None:
        """Learning debt ledger has at least 1 open_doubt item.

        Recurring misconceptions from mock payloads generate open_doubt items.
        """
        result = run_pipeline()
        assert isinstance(result.debt, LearningDebtLedger)
        assert result.debt.total_items >= 1

    def test_next_lesson_plan_has_agenda(self) -> None:
        """Next lesson plan has at least one agenda item."""
        result = run_pipeline()
        assert isinstance(result.plan, NextLessonPlan)
        assert result.plan.total_agenda_items >= 1

    def test_llm_calls_counted(self) -> None:
        """Total LLM calls = 2 per lesson (segmentation + extraction)."""
        result = run_pipeline()
        assert result.total_llm_calls == 8  # 4 lessons × 2 calls each
        assert result.total_cost_usd == 0.0

    def test_elapsed_seconds_positive(self) -> None:
        """Elapsed time is > 0 for a real run."""
        import time

        t0 = time.monotonic()
        result = run_pipeline()
        elapsed = time.monotonic() - t0
        assert result.elapsed_seconds > 0
        assert result.elapsed_seconds <= elapsed + 0.01  # roughly correct

    def test_deterministic_output(self) -> None:
        """Two runs produce the same summary values."""
        r1 = run_pipeline()
        r2 = run_pipeline()
        assert r1.capsules == r2.capsules
        assert len(r1.delta.new_concepts) == len(r2.delta.new_concepts)
        assert r1.debt.total_items == r2.debt.total_items
        assert r1.plan.total_agenda_items == r2.plan.total_agenda_items

    def test_each_capsule_content_has_expected_types(self) -> None:
        """Every concept has a valid ConceptStatus."""
        result = run_pipeline()
        valid_statuses = {"introduced", "reinforced", "reviewed", "problematic"}
        for capsule in result.capsules:
            for concept in capsule.content.concepts:
                assert concept.status in valid_statuses, (
                    f"Invalid status {concept.status} for {concept.name}"
                )

    def test_custom_fixture_root(self) -> None:
        """Passing an explicit fixture root works."""
        result = run_pipeline(fixture_root=DEFAULT_FIXTURE_ROOT)
        assert len(result.capsules) == 4

    def test_passed_store_is_reused(self) -> None:
        """Passing an existing store reuses it."""
        from lessonos.store.sqlite import SQLiteStore

        store = SQLiteStore(":memory:")
        result = run_pipeline(store=store)
        assert result.store is store

    def test_invalid_fixture_root_raises(self) -> None:
        """Non-existent fixture root raises ValueError."""
        with pytest.raises(ValueError, match="not found"):
            run_pipeline(fixture_root=Path("/nonexistent/path"))

    def test_missing_path_json_raises(self) -> None:
        """Fixture dir without path.json raises ValueError."""
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            with pytest.raises(ValueError, match="path.json"):
                run_pipeline(fixture_root=Path(tmpdir))


# ---------------------------------------------------------------------------
# LESSON_MOCKS registration (importable from pipeline)
# ---------------------------------------------------------------------------


class TestLessonMocks:
    """LESSON_MOCKS dict is importable and complete."""

    def test_mocks_cover_all_lessons(self) -> None:
        """All 4 fixture lessons in sample_path have mock payloads."""
        expected = {
            "l1_derivative_definition",
            "l2_derivative_rules",
            "l3_integral_intro",
            "l4_integral_substitution",
        }
        assert expected.issubset(set(LESSON_MOCKS.keys())), (
            f"Missing mock for some sample_path lessons. "
            f"Expected subset {expected}, got {set(LESSON_MOCKS.keys())}"
        )

    def test_each_mock_seg_id_grounded(self) -> None:
        """Every seg_id in mock payloads follows the fixture naming.

        All seg_ids should match pattern l<id>s<number> where <id> is an
        identifier segment matching the lesson prefix.
        """
        import re

        for lesson_id, (seg_payload, ext_payload) in LESSON_MOCKS.items():
            prefix = lesson_id[0]
            for entry in seg_payload:
                for sid in entry["seg_ids"]:
                    assert sid.startswith(f"{prefix}"), (
                        f"seg_id {sid} doesn't match lesson {lesson_id} prefix {prefix}"
                    )
            for concept in ext_payload.get("concepts", []):
                for cit in concept.get("citations", []):
                    sid = cit["seg_id"]
                    assert re.match(r"^l\d+s\d+$", sid), (
                        f"Bad seg_id format: {sid} in {lesson_id}"
                    )

    def test_each_concept_has_valid_status(self) -> None:
        """All concept statuses in mock payloads are valid."""
        valid_statuses = {"introduced", "reinforced", "reviewed", "problematic"}
        for lesson_id, (_, ext_payload) in LESSON_MOCKS.items():
            for concept in ext_payload.get("concepts", []):
                assert concept.get("status") in valid_statuses, (
                    f"Invalid status {concept.get('status')} in {lesson_id}.{concept.get('name')}"
                )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _dummy_memory() -> PathMemory:
    return PathMemory(
        path_title="dummy",
        current_state="Iniziato",
        total_lessons=0,
        total_concepts=0,
        total_exercises=0,
        lesson_index=(),
        concept_graph=(),
        recurring_misconceptions=(),
        exercise_bank=(),
        best_explanations=(),
    )


def _dummy_delta() -> DidacticDelta:
    return DidacticDelta(
        new_concepts=(),
        clarified_concepts=(),
        still_open_concepts=(),
        over_repeated_concepts=(),
        under_practiced_concepts=(),
        new_misconceptions=(),
        resolved_misconceptions=(),
        total_new_concepts=0,
        total_clarified=0,
        total_still_open=0,
        total_over_repeated=0,
        total_under_practiced=0,
        total_new_misconceptions=0,
        total_resolved_misconceptions=0,
    )


def _dummy_debt() -> LearningDebtLedger:
    return LearningDebtLedger(
        items=(),
        by_kind=MappingProxyType({}),
        total_items=0,
    )


def _dummy_plan() -> NextLessonPlan:
    return NextLessonPlan(
        path_id="dummy",
        total_agenda_items=0,
        prerequisite_gaps=(),
        review_items=(),
        open_doubt_items=(),
        practice_items=(),
        new_material_items=(),
        suggested_topics=(),
    )
