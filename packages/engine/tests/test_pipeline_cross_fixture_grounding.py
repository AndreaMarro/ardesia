"""Cross-fixture grounding audit for LessonOS pipeline.

Runs ``run_pipeline`` on every fixture path and verifies that ALL
citations in ALL produced capsules resolve to real segments (seg_id
existence + excerpt substring match). This is the **grounding invariant**
applied across every domain — calculus (sample), spaced repetition, biology.

Each fixture path is tested as a separate parametrized test case so
a failure in one domain does not hide another.
"""

from pathlib import Path

import pytest

from lessonos.pipeline import run_pipeline
from lessonos.store.sqlite import SQLiteStore

# ---------------------------------------------------------------------------
# Fixture paths under test
# ---------------------------------------------------------------------------
FIXTURE_ROOTS: tuple[tuple[str, int], ...] = (
    ("sample_path", 4),
    ("spaced_path", 2),
    ("bio_path", 2),
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent


@pytest.mark.parametrize("rel_path,expected_n_lessons", FIXTURE_ROOTS)
def test_cross_fixture_grounding_audit(
    rel_path: str,
    expected_n_lessons: int,
) -> None:
    """Verify grounding invariants across all fixture paths.

    For each capsule produced by ``run_pipeline`` on the given fixture
    path, every citation's ``seg_id`` must resolve to a real Segment in
    the store, and every non-None ``excerpt`` must be a substring of that
    segment's text.
    """
    fixture_root = PROJECT_ROOT / "fixtures" / rel_path
    store = SQLiteStore(":memory:")

    result = run_pipeline(fixture_root=fixture_root, store=store)

    # Sanity check — pipeline produced the expected number of capsules
    assert len(result.capsules) == expected_n_lessons, (
        f"Expected {expected_n_lessons} capsules for {rel_path}, "
        f"got {len(result.capsules)}"
    )
    assert result.path_id, f"Path ID should be non-empty for {rel_path}"

    for capsule in result.capsules:
        lesson_id = capsule.lesson_id

        # Gather all citations from every part of the capsule
        citations: list[tuple[str | None, str, str]] = []  # (excerpt, seg_id, source_context)

        for concept in capsule.content.concepts:
            for cit in concept.citations:
                citations.append((cit.excerpt, cit.seg_id, f"concept[{concept.name}]"))

        for ex in capsule.content.exercises:
            for cit in ex.citations:
                citations.append((cit.excerpt, cit.seg_id, f"exercise[{ex.prompt[:30]}]"))

        for q in capsule.content.student_questions:
            for cit in q.citations:
                citations.append((cit.excerpt, cit.seg_id, f"question[{q.question[:30]}]"))

        for hw in capsule.content.homework:
            for cit in hw.citations:
                citations.append((cit.excerpt, cit.seg_id, f"homework[{hw.task[:30]}]"))

        # Skip capsules with no citations — some lessons may have zero
        # extracted citations (edge case: purely narrative lesson).

        for excerpt, seg_id, source in citations:
            # seg_id must resolve
            segment = store.get_segment(seg_id)
            assert segment is not None, (
                f"Capsule {lesson_id} (fixtures/{rel_path}): "
                f"Citation seg_id={seg_id} (from {source}) does not "
                f"resolve to a persisted segment"
            )

            # excerpt, if present, must be a substring of the segment text
            if excerpt is not None:
                assert excerpt in segment.text, (
                    f"Capsule {lesson_id} (fixtures/{rel_path}): "
                    f"Citation excerpt={excerpt!r} (seg_id={seg_id}, "
                    f"from {source}) not found in segment text: "
                    f"{segment.text[:100]!r}…"
                )


def test_cross_fixture_grounding_audit_duplicate_seg_id_still_resolves() -> None:
    """If the same seg_id appears in multiple capsules (cross-lesson),
    it should still resolve when queried from the store that contains
    all ingested lessons.

    This tests that ingest across multiple lessons does not clobber
    segments, and that the store correctly maps seg_id → segment
    regardless of which lesson referenced it.
    """
    fixture_root = PROJECT_ROOT / "fixtures" / "sample_path"
    store = SQLiteStore(":memory:")

    result = run_pipeline(fixture_root=fixture_root, store=store)

    # Collect all seg_ids cited across all capsules
    all_cited: set[str] = set()
    for capsule in result.capsules:
        for concept in capsule.content.concepts:
            for cit in concept.citations:
                all_cited.add(cit.seg_id)
        for ex in capsule.content.exercises:
            for cit in ex.citations:
                all_cited.add(cit.seg_id)
        for q in capsule.content.student_questions:
            for cit in q.citations:
                all_cited.add(cit.seg_id)
        for hw in capsule.content.homework:
            for cit in hw.citations:
                all_cited.add(cit.seg_id)

    # Every cited seg_id must resolve
    for seg_id in all_cited:
        segment = store.get_segment(seg_id)
        assert segment is not None, (
            f"seg_id={seg_id} cited across capsules but does not "
            f"resolve in the cross-lesson store"
        )


def test_cross_fixture_grounding_audit_no_seg_id_invented() -> None:
    """No citation should reference a seg_id that does not exist in
    ANY fixture's transcript data. This is a negative test: if a
    seg_id like ``l99s99`` appeared in a citation, the store lookup
    should return None, and the test would catch it.

    We use the bio_path fixture (smallest) as the canary.
    """
    fixture_root = PROJECT_ROOT / "fixtures" / "bio_path"
    store = SQLiteStore(":memory:")

    result = run_pipeline(fixture_root=fixture_root, store=store)

    for capsule in result.capsules:
        lesson_id = capsule.lesson_id
        seg_ids = {cit.seg_id for concept in capsule.content.concepts for cit in concept.citations}
        for seg_id in seg_ids:
            segment = store.get_segment(seg_id)
            # This assertion would fail if a mock referenced a non-existent seg_id
            assert segment is not None, (
                f"Capsule {lesson_id} (bio_path): seg_id={seg_id} "
                f"does not resolve — would be an invented citation"
            )


def test_store_returns_none_for_nonexistent_seg_id() -> None:
    """The grounding invariant MUST fail when a citation references a
    non-existent seg_id. This test verifies that the check is real:
    it checks that ``store.get_segment`` returns None for a bogus seg_id.

    We test the framework itself, not the production code — this
    proves the audit is non-tautological.
    """
    fixture_root = PROJECT_ROOT / "fixtures" / "spaced_path"
    store = SQLiteStore(":memory:")
    result = run_pipeline(fixture_root=fixture_root, store=store)

    # Look for a capsule, then try a seg_id we KNOW is bogus
    capsule = result.capsules[0]
    segment = store.get_segment("l99s99")
    assert segment is None, (
        "Bogus seg_id='l99s99' should not resolve to any segment — "
        "if this passes, the store is leaking phantom segments"
    )

    # Also verify that every real seg_id in the capsule does resolve
    seg_ids = {cit.seg_id for concept in capsule.content.concepts for cit in concept.citations}
    for seg_id in seg_ids:
        s = store.get_segment(seg_id)
        assert s is not None, (
            f"Real seg_id={seg_id} from {capsule.lesson_id} should resolve"
        )
