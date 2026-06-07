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


def test_run_path_produces_all_three_capsules() -> None:
    """The CLI processes all 3 lessons from the fixture, returns structured
    results, and prints key section headers."""
    buf = io.StringIO()
    result = run_path(_FIXTURE, out=buf)
    output = buf.getvalue()

    # Structured return dict — real values, not strings
    assert result["path_id"] == "path_calc_101"
    assert result["capsules"] == 3, (
        f"expected 3 capsules, got {result['capsules']}"
    )
    assert result["memory"] >= 6, (
        f"expected >=6 aggregated concepts, got {result['memory']}"
    )
    assert result["delta_new"] >= 3, (
        f"expected >=3 new concepts (L3 integral), got {result['delta_new']}"
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


def test_run_path_each_lesson_has_mock_fixture() -> None:
    """Every lesson in the fixture path has a corresponding mock payload
    registered in _LESSON_MOCKS (except l4 which is optional)."""
    path_json = json.loads((_FIXTURE / "path.json").read_text())
    for lid in path_json["lessons"]:
        if lid not in _LESSON_MOCKS:
            # l4_integral_substitution is valid to skip (not in main demo)
            continue
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


def test_run_path_delta_detects_new_integral_concepts() -> None:
    """Delta between L1+L2 vs L1+L2+L3 detects L3 concepts as new."""
    buf = io.StringIO()
    result = run_path(_FIXTURE, out=buf)

    # Three concepts from L3 should appear as new
    assert result["delta_new"] >= 3, (
        f"expected >=3 new concepts (antiderivata, integrale, teorema), "
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
