"""Test pipeline cross-fixture generality: spaced_path domain."""
from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest

from lessonos.pipeline import PipelineResult, run_pipeline
from lessonos.store.sqlite import SQLiteStore

HERE = Path(__file__).resolve().parent
FIXTURE_ROOT = HERE.parent / "fixtures" / "spaced_path"


class TestPipelineSpacedPath:
    """Pipeline runs correctly on a different fixture domain (spaced repetition)."""

    @pytest.fixture
    def result(self) -> PipelineResult:
        return run_pipeline(fixture_root=FIXTURE_ROOT)

    def test_run_produces_two_capsules(self, result: PipelineResult) -> None:
        """Spaced path has 2 lessons -> 2 capsules."""
        assert len(result.capsules) == 2, f"Expected 2 capsules, got {len(result.capsules)}"

    def test_capsules_have_correct_lesson_ids(self, result: PipelineResult) -> None:
        """Capsules match fixture lesson IDs."""
        ids = tuple(c.lesson_id for c in result.capsules)
        assert ids == ("l1_sm2_intro", "l2_fsrs_advanced"), f"Unexpected lesson IDs: {ids}"

    def test_capsule_content_grounded_on_real_seg_ids(self, result: PipelineResult) -> None:
        """Every citation seg_id resolves to a real fixture segment."""
        store = result.store
        for capsule in result.capsules:
            for concept in capsule.content.concepts:
                for citation in concept.citations:
                    seg = store.get_segment(citation.seg_id)
                    assert seg is not None, (
                        f"Capsule {capsule.lesson_id}: citation seg_id "
                        f"{citation.seg_id!r} not found in store"
                    )

    def test_path_memory_aggregates_seven_concepts(self, result: PipelineResult) -> None:
        """2 capsules -> 7 concepts across both lessons (3+4)."""
        assert result.memory.total_concepts == 7, (
            f"Expected 7 concepts, got {result.memory.total_concepts}"
        )

    def test_delta_detects_four_new_concepts(self, result: PipelineResult) -> None:
        """Delta detects 4 new FSRS concepts from lesson 2."""
        assert len(result.delta.new_concepts) == 4, (
            f"Expected 4 new concepts in delta, got {len(result.delta.new_concepts)}"
        )

    def test_plan_has_four_new_material_items(self, result: PipelineResult) -> None:
        """NextLessonPlan has 4 new_material items (one per FSRS concept)."""
        assert len(result.plan.new_material_items) == 4, (
            f"Expected 4 new_material items, got {len(result.plan.new_material_items)}"
        )

    def test_plan_all_new_material_priority_four(self, result: PipelineResult) -> None:
        """All new_material items have priority 4."""
        for item in result.plan.new_material_items:
            assert item.priority == 4, (
                f"Expected priority=4 for new_material item, got {item.priority}: {item.description}"
            )

    def test_debt_has_two_items(self, result: PipelineResult) -> None:
        """Learning debt = 2 (one open doubt from each lesson)."""
        assert result.debt.total_items == 2, (
            f"Expected 2 debt items, got {result.debt.total_items}"
        )

    def test_path_id_correct(self, result: PipelineResult) -> None:
        """Path ID matches fixture manifest."""
        assert result.path_id == "path_learning_101", (
            f"Expected path_learning_101, got {result.path_id}"
        )

    def test_deterministic_across_runs(self) -> None:
        """Two identical runs produce identical semantic results."""
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT)
        assert r1.elapsed_seconds >= 0.0
        assert r2.elapsed_seconds >= 0.0
        assert replace(r1, store=None, elapsed_seconds=0.0) == replace(
            r2, store=None, elapsed_seconds=0.0
        )

    def test_fresh_store_each_run(self) -> None:
        """Each run gets a fresh in-memory store -> no cross-contamination."""
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT)
        assert r1.store is not r2.store, "Runs share the same store object"

    def test_spaced_path_idempotent_load(self) -> None:
        """Repeated run_pipeline is safe — load_sample_path uses INSERT OR REPLACE."""
        store = SQLiteStore(":memory:")
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT, store=store)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT, store=store)
        assert len(r2.capsules) == 2, (
            f"Expected 2 capsules after re-run, got {len(r2.capsules)}"
        )
        assert r2.memory.total_concepts == 7, (
            f"Expected 7 concepts after re-run, got {r2.memory.total_concepts}"
        )

    def test_summary_contains_new_material_count(self, result: PipelineResult) -> None:
        """Summary includes delta count from plan."""
        assert f"4 new-delta" in result.summary, (
            f"Summary {result.summary!r} missing '4 new-delta'"
        )
