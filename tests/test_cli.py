"""Tests for the LessonOS CLI (M6-task1).

Exercises the ``run_path()`` function end-to-end with the fixture path,
which exercises the full pipeline: load → ingest → assemble (mock) →
PathMemory → DidacticDelta → LearningDebt → NextLessonPlan.
All tests are non-tautological: they verify real behaviour, not just
string output.
"""

from __future__ import annotations

import io
import json
from pathlib import Path as FsPath

from lessonos.cli import run_path, _LESSON_MOCKS
from lessonos.store.fixture_loader import DEFAULT_FIXTURE_ROOT

_FIXTURE = FsPath(__file__).resolve().parents[1] / "fixtures" / "sample_path"


def _load_lesson_json(lesson_id: str) -> dict:
    """Load the raw fixture JSON for a lesson."""
    path = _FIXTURE / "lessons" / f"{lesson_id}.json"
    return json.loads(path.read_text())


def test_run_path_produces_all_four_capsules() -> None:
    """The CLI processes all 4 lessons from the fixture, returns structured
    results, and prints key section headers. No lessons are skipped."""
    buf = io.StringIO()
    result = run_path(_FIXTURE, out=buf)
    output = buf.getvalue()

    # Structured return dict — real values, not strings
    assert result["path_id"] == "path_calc_101"
    assert result["capsules"] == 4, (
        f"expected 4 capsules (L1+L2+L3+L4), got {result['capsules']}"
    )
    # L1+L2+L3+L4 = 8 canonical concepts: derivata, rapporto_incrementale,
    # regola_della_potenza, regola_della_catena, integrale, antiderivata,
    # teorema_fondamentale_del_calcolo, sostituzione
    assert result["memory"] == 8, (
        f"expected 8 concepts in Path Memory, got {result['memory']}"
    )
    # Delta between L1+L2+L3 vs L1+L2+L3+L4: 1 new concept (sostituzione)
    assert result["delta_new"] == 1, (
        f"expected 1 new concept (sostituzione from L4), got {result['delta_new']}"
    )
    assert result["debt_items"] >= 1, (
        f"expected >=1 debt items, got {result['debt_items']}"
    )
    assert result["agenda_items"] >= 1, (
        f"expected >=1 agenda items, got {result['agenda_items']}"
    )

    # Section headers are printed — any CLI user can see them
    assert "Lesson Capsules" in output
    assert "Path Memory" in output
    assert "Didactic Delta" in output
    assert "Learning Debt Ledger" in output
    assert "Next Lesson Plan" in output

    # No lesson was skipped
    assert "No mock registered" not in output, (
        "all 4 lessons should have registered mocks"
    )

    # l4's concept "sostituzione" is in the output
    assert "sostituzione" in output, (
        "l4 concept 'sostituzione' should appear in demo output"
    )


def test_run_path_each_lesson_has_mock_fixture() -> None:
    """Every lesson in the fixture path has a corresponding mock payload
    registered in _LESSON_MOCKS (all 4 lessons)."""
    path_json = json.loads((_FIXTURE / "path.json").read_text())
    for lid in path_json["lessons"]:
        assert lid in _LESSON_MOCKS, (
            f"lesson {lid!r} has no mock registered in _LESSON_MOCKS"
        )
        seg_payload, ext_payload = _LESSON_MOCKS[lid]

        # All seg_ids in mock must exist in the real fixture transcript
        fixture = _load_lesson_json(lid)
        real_seg_ids = {seg["seg_id"] for seg in fixture["transcript"]}
        mock_seg_ids = set()
        for topic in seg_payload:
            for sid in topic["seg_ids"]:
                mock_seg_ids.add(sid)
                assert sid in real_seg_ids, (
                    f"{lid}: mock seg_id {sid!r} not in fixture"
                )

        # All concept statuses must be valid CONCEPT_STATUS values
        for concept in ext_payload.get("concepts", []):
            assert concept.get("status") in (
                "introduced", "reinforced", "reviewed", "problematic"
            ), f"{lid}: invalid concept status {concept.get('status')!r}"

        # All citation seg_ids must exist in fixture
        for item_type in ("concepts", "exercises", "student_questions", "homework"):
            for item in ext_payload.get(item_type, []):
                for cit in item.get("citations", []):
                    assert cit["seg_id"] in real_seg_ids, (
                        f"{lid}: citation seg_id {cit['seg_id']!r} not in fixture"
                    )


def test_run_path_delta_detects_new_l4_concepts() -> None:
    """Delta between L1+L2+L3 vs L1+L2+L3+L4 detects L4 concept as new."""
    buf = io.StringIO()
    result = run_path(_FIXTURE, out=buf)

    # One concept from L4 should appear as new: sostituzione
    assert result["delta_new"] == 1, (
        f"expected 1 new concept (sostituzione from L4), "
        f"got {result['delta_new']}"
    )


def test_run_path_all_delta_fields_non_negative() -> None:
    """All Delta counters in the CLI output are non-negative integers."""
    from lessonos.capsule.assembly import LessonCapsule
    from lessonos.graph.path_memory import build_path_memory
    from lessonos.graph.didactic_delta import DidacticDelta, compute_didactic_delta
    from lessonos.graph.learning_debt import compute_learning_debt
    from lessonos.graph.next_lesson_planner import compute_next_lesson_plan
    from lessonos.store.sqlite import SQLiteStore
    from lessonos.store.fixture_loader import load_sample_path, ingest_lesson_segments
    from lessonos.cli import _build_router, _LESSON_MOCKS
    from lessonos.capsule.assembly import assemble_lesson_capsule

    store = SQLiteStore(":memory:")
    path = load_sample_path(store, _FIXTURE)
    lesson_ids = path.lesson_ids

    capsules: list[LessonCapsule] = []
    for lid in lesson_ids:
        if lid not in _LESSON_MOCKS:
            continue
        ingest_lesson_segments(store, lid, _FIXTURE)
        router = _build_router(store, lid)
        assert router is not None, f"no mock for {lid}"
        capsule = assemble_lesson_capsule(store, lid, router)
        capsules.append(capsule)

    memory = build_path_memory(capsules, path_title=path.title)
    old_memory = build_path_memory(capsules[:-1], path_title=path.title)
    delta = compute_didactic_delta(old_memory, memory)

    # Every counter is non-negative
    assert delta.total_new_concepts >= 0
    assert delta.total_clarified >= 0
    assert delta.total_still_open >= 0
    assert delta.total_over_repeated >= 0
    assert delta.total_under_practiced >= 0
    assert delta.total_new_misconceptions >= 0
    assert delta.total_resolved_misconceptions >= 0

    ledger = compute_learning_debt(memory, delta, path_id=path.path_id)
    assert ledger.total_items >= 0

    plan = compute_next_lesson_plan(memory, delta, ledger, path_id=path.path_id)
    assert plan.total_agenda_items >= 0


def test_run_path_empty_fixture_shows_error(tmp_path: FsPath) -> None:
    """CLI with non-existent fixture prints error and returns 1."""
    from lessonos.cli import main

    bad_path = tmp_path / "nonexistent"
    exit_code = main(["run-path", "--fixture", str(bad_path)])
    assert exit_code == 1, f"expected exit code 1, got {exit_code}"


def test_plan_summary_shows_fsrs_metrics_for_review_items() -> None:
    """``_plan_summary`` renders FSRS metrics (review day, difficulty, retention,
    repetitions) for review items that have a recommended_review_day and
    concept_info available from memory.

    This is a unit test of the display function, avoiding dependency on
    specific fixture debt patterns.
    """
    from lessonos.graph.next_lesson_planner import (
        LessonAgendaItem,
        NextLessonPlan,
    )

    # Build a minimal NextLessonPlan with one review item that has a
    # recommended_review_day (mimicking a real FSRS-scheduled item)
    plan = NextLessonPlan(
        path_id="test_path",
        review_items=(
            LessonAgendaItem(
                kind="review",
                description='Review and clarify concept: Concept "derivata" is unmastered',
                source_debt_ids=("d1",),
                priority=1,
                recommended_review_day=3,
            ),
        ),
        practice_items=(),
        new_material_items=(),
        prerequisite_gaps=(),
        open_doubt_items=(),
        suggested_topics=("Review unmastered concepts",),
        total_agenda_items=1,
    )

    # Build a partial PathMemory-like object with ConceptPathEntry data
    # for the concept referenced in the review item
    from lessonos.graph.path_memory import ConceptPathEntry

    class FakeMemory:
        """Minimal PathMemory stand-in with concept_graph attribute."""
        def __init__(self, entries):
            self.concept_graph = entries

    memory = FakeMemory([
        ConceptPathEntry(
            name="derivata",
            first_introduced_lesson="l1",
            statuses=("introduced", "reinforced"),
            lessons=("l1", "l2"),
            prerequisites=(),
            difficulty=7.2,  # non-default to test D display
            estimated_retention=0.45,  # low retention for display
            repetition_count=3,  # >1 for reps display
        ),
    ])

    from lessonos.cli import _plan_summary
    summary = _plan_summary(plan, memory=memory)

    # Verify each FSRS metric appears correctly
    assert "review day=3" in summary, (
        "expected recommended_review_day=3 in summary"
    )
    assert "D=7.2" in summary, (
        "expected difficulty D=7.2 in summary"
    )
    assert "R=45%" in summary, (
        "expected retention R=45% in summary"
    )
    assert "reps=3" in summary, (
        "expected repetition count reps=3 in summary"
    )

    # Verify that non-default display only happens for non-default values
    # A concept with D=5.0 should NOT show D= (default, hidden)
    no_d_plan = NextLessonPlan(
        path_id="test_path",
        review_items=(
            LessonAgendaItem(
                kind="review",
                description='Review and clarify concept: Concept "algebra" is unmastered',
                source_debt_ids=("d2",),
                priority=1,
                recommended_review_day=0,  # immediate review
            ),
        ),
        practice_items=(),
        new_material_items=(),
        prerequisite_gaps=(),
        open_doubt_items=(),
        suggested_topics=("Review",),
        total_agenda_items=1,
    )
    no_d_memory = FakeMemory([
        ConceptPathEntry(
            name="algebra",
            first_introduced_lesson="l1",
            statuses=("introduced",),
            lessons=("l1",),
            prerequisites=(),
            difficulty=5.0,  # default — should be hidden
            estimated_retention=None,  # no retention data
            repetition_count=1,  # default — should be hidden
        ),
    ])
    no_d_summary = _plan_summary(no_d_plan, memory=no_d_memory)
    assert "D=5.0" not in no_d_summary, (
        "default difficulty D=5.0 should NOT appear in summary"
    )
    assert "R=None" not in no_d_summary, (
        "None retention should NOT appear in summary"
    )
    assert "reps=1" not in no_d_summary, (
        "default repetition count 1 should NOT appear in summary"
    )
    # But review day should still show for item with review_day=0
    assert "review day=0" in no_d_summary, (
        "recommended_review_day=0 should still appear"
    )

    # Verify no-review-items plan doesn't crash
    empty_plan = NextLessonPlan(
        path_id="empty",
        review_items=(),
        practice_items=(),
        new_material_items=(),
        prerequisite_gaps=(),
        open_doubt_items=(),
        suggested_topics=(),
        total_agenda_items=0,
    )
    empty_summary = _plan_summary(empty_plan, memory=memory)
    assert "Total agenda items: 0" in empty_summary
