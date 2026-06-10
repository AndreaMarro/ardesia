"""Shared grounding verification for Lesson Graph citations (PLAN §13.4).

Extracted from GraphWriter._collect_evidence (writer.py:99-122) per Claude
correction #2 (T6 PLAN-CHECK 2026-06-10): every citation — whether from the
graph writer, the summarizer, or future components — MUST pass the same
verification:
  ``verify_citation(store, seg_id, lesson_id, excerpt)``

  1. ``seg_id`` resolves to a persisted ``Segment`` in the store.
  2. The segment belongs to the *same lesson* (no cross-lesson contamination
     — this is the invariant from T5-FIX).
  3. ``excerpt`` (when present) is a verbatim substring of the segment text.

Raises ``ValueError`` on the FIRST violation.
"""

from __future__ import annotations

from lessonos.store.base import Store


def verify_citation(
    store: Store,
    seg_id: str,
    lesson_id: str,
    excerpt: str | None = None,
) -> None:
    """Verify that a citation is grounded in a persisted, same-lesson segment.

    Args:
        store: Persistence layer with ``get_segment``.
        seg_id: The segment ID to resolve.
        lesson_id: The lesson the citation belongs to. Enforces that the
            resolved segment belongs to this lesson (cross-lesson
            contamination guard — T5-FIX).
        excerpt: Optional text that must be a verbatim substring of the
            segment text. Pass ``None`` to skip the substring check.

    Raises:
        ValueError: If the seg_id does not resolve, the segment belongs to
            a different lesson, or the excerpt is not a verbatim substring.
    """
    seg = store.get_segment(seg_id)
    if seg is None:
        raise ValueError(
            f"citation seg_id {seg_id!r} does not resolve to a "
            f"persisted segment"
        )

    if lesson_id and seg.lesson_id != lesson_id:
        raise ValueError(
            f"citation seg_id {seg_id!r} resolves to lesson "
            f"{seg.lesson_id!r} but citation belongs to lesson "
            f"{lesson_id!r} (cross-lesson contamination)"
        )

    if excerpt is not None and excerpt not in seg.text:
        raise ValueError(
            f"citation excerpt {excerpt!r} is not a verbatim substring "
            f"of segment {seg_id}: {seg.text!r}"
        )
