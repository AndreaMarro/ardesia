"""Test pipeline cross-fixture generality: bio_path (fotosintesi) domain."""
from __future__ import annotations

import re
from pathlib import Path

import pytest

from lessonos.pipeline import PipelineResult, run_pipeline
from lessonos.store.sqlite import SQLiteStore

HERE = Path(__file__).resolve().parent
FIXTURE_ROOT = HERE.parent / "fixtures" / "bio_path"


class TestPipelineBioPath:
    """Pipeline runs correctly on a third fixture domain (biology: fotosintesi)."""

    @pytest.fixture
    def result(self) -> PipelineResult:
        return run_pipeline(fixture_root=FIXTURE_ROOT)

    def test_run_produces_two_capsules(self, result: PipelineResult) -> None:
        """Bio path has 2 lessons -> 2 capsules."""
        assert len(result.capsules) == 2, f"Expected 2 capsules, got {len(result.capsules)}"

    def test_capsules_have_correct_lesson_ids(self, result: PipelineResult) -> None:
        """Capsules match fixture lesson IDs."""
        ids = tuple(c.lesson_id for c in result.capsules)
        assert ids == ("l1_fotosintesi_intro", "l2_reazioni_luce"), (
            f"Unexpected lesson IDs: {ids}"
        )

    def test_capsule_content_grounded_on_real_seg_ids(self, result: PipelineResult) -> None:
        """Every citation seg_id resolves to a real fixture segment and every excerpt
        is a substring of the source segment text.

        This is the core anti-hallucination invariant (grounding check):
        every claim must be traceable to a real source segment, and every excerpt
        must actually appear in that segment's text.
        """
        store = result.store
        for capsule in result.capsules:
            for concept in capsule.content.concepts:
                for citation in concept.citations:
                    seg = store.get_segment(citation.seg_id)
                    assert seg is not None, (
                        f"Capsule {capsule.lesson_id}: citation seg_id "
                        f"{citation.seg_id!r} not found in store"
                    )
                    # excerpt must be a substring of the source segment text
                    # (case-insensitive, since fixtures may vary in casing)
                    if citation.excerpt is not None:
                        assert citation.excerpt.lower() in seg.text.lower(), (
                            f"Capsule {capsule.lesson_id}: excerpt {citation.excerpt!r} "
                            f"not found in segment text {seg.text!r}"
                        )

    def test_path_memory_aggregates_five_concepts(self, result: PipelineResult) -> None:
        """2 capsules -> 5 concepts (2 from l1 + 3 from l2)."""
        assert result.memory.total_concepts == 5, (
            f"Expected 5 concepts, got {result.memory.total_concepts}"
        )

    def test_delta_detects_three_new_concepts(self, result: PipelineResult) -> None:
        """Delta detects 3 new concepts from lesson 2 (tilacoide, catena, ciclo)."""
        assert len(result.delta.new_concepts) == 3, (
            f"Expected 3 new concepts in delta, got {len(result.delta.new_concepts)}"
        )

    def test_plan_has_three_new_material_items(self, result: PipelineResult) -> None:
        """NextLessonPlan has 3 new_material items (one per l2 concept)."""
        assert len(result.plan.new_material_items) == 3, (
            f"Expected 3 new_material items, got {len(result.plan.new_material_items)}"
        )

    def test_plan_all_new_material_priority_four(self, result: PipelineResult) -> None:
        """All new_material items have priority 4.

        Priority 4 = lowest priority tier, assigned to new concepts that haven't
        been reviewed yet (NextLessonPlan sorts: prerequisite gaps at 0, review at 1,
        open_doubt at 2, practice at 3, new_material at 4). Since this is a
        deterministic mock test, the exact value is an invariant.
        """
        for item in result.plan.new_material_items:
            assert item.priority == 4, (
                f"Expected priority=4 for new_material item, got {item.priority}: {item.description}"
            )

    def test_debt_has_two_open_doubt_items(self, result: PipelineResult) -> None:
        """Learning debt = 2 items, both open_doubt kind (one doubt marker per lesson).

        l1 has marker_doubt on l1s3, l2 has marker_error on l2s3.
        Both generate open_doubt debt items (doubt/error markers = unresolved questions).
        """
        assert result.debt.total_items == 2, (
            f"Expected 2 debt items, got {result.debt.total_items}"
        )
        # Verify both items are open_doubt kind
        for item in result.debt.items:
            assert item.kind == "open_doubt", (
                f"Expected kind=open_doubt, got {item.kind} for {item.description}"
            )

    def test_path_id_correct(self, result: PipelineResult) -> None:
        """Path ID matches fixture manifest."""
        assert result.path_id == "path_bio_101", (
            f"Expected path_bio_101, got {result.path_id}"
        )

    def test_deterministic_across_runs(self) -> None:
        """Two identical runs produce identical summaries, ignoring wall-clock."""
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT)
        # elapsed_seconds is a wall-clock measurement: it is not part of the
        # determinism contract and made this test flaky under load (2/10).
        # Mask it by shape rather than dropping the last comma-separated field,
        # so a field appended to the summary later stays inside the comparison.
        def mask_elapsed(summary: str) -> str:
            masked, count = re.subn(r"\b\d+\.\d+s\b", "<elapsed>", summary)
            assert count == 1, f"expected exactly one elapsed field in: {summary}"
            return masked

        assert mask_elapsed(r1.summary) == mask_elapsed(r2.summary), (
            f"Non-deterministic pipeline:\n  run1: {r1.summary}\n  run2: {r2.summary}"
        )

    def test_fresh_store_each_run(self) -> None:
        """Each run gets a fresh in-memory store -> no cross-contamination."""
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT)
        assert r1.store is not r2.store, "Runs share the same store object"

    def test_bio_path_idempotent_load(self) -> None:
        """Repeated run_pipeline is safe — load_sample_path uses INSERT OR REPLACE."""
        store = SQLiteStore(":memory:")
        r1 = run_pipeline(fixture_root=FIXTURE_ROOT, store=store)
        r2 = run_pipeline(fixture_root=FIXTURE_ROOT, store=store)
        assert len(r2.capsules) == 2, (
            f"Expected 2 capsules after re-run, got {len(r2.capsules)}"
        )
        assert r2.memory.total_concepts == 5, (
            f"Expected 5 concepts after re-run, got {r2.memory.total_concepts}"
        )

    def test_all_concept_names_bio_domain(self, result: PipelineResult) -> None:
        """All concept names are biology-domain (no calculus/learning-science leakage)."""
        bio_names = [c.name for c in result.memory.concept_graph]
        expected_set = {
            "fotosintesi clorofilliana",
            "cloroplasto",
            "tilacoide",
            "catena di trasporto elettronico",
            "ciclo di Calvin",
        }
        assert set(bio_names) == expected_set, (
            f"Concept names mismatch. Got {set(bio_names)}, expected {expected_set}"
        )
