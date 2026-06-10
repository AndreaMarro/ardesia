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


# ── Grounding policy (T6R — anti-false-verde, Andrea-ratified 2026-06-10) ──
#
# A citation is VERIFIED iff it carries a non-empty excerpt. The pipeline
# guarantees a non-None excerpt is a verbatim substring of its segment
# (extraction repairs to a real substring or sets None; ``verify_citation``
# above raises on a non-verbatim excerpt). Therefore "excerpt present" ⟺
# "verbatim-grounded". A citation with excerpt None/"" points at a segment but
# quotes nothing — it is UNVERIFIED and must never be presented as grounded
# evidence. This is the structural hole behind the Terza-lezione false-verde
# (80/80 NULL excerpts passed as genuine citations).

MAX_UNVERIFIED_RATIO = 0.20
"""Acceptance fails when MORE than this fraction of a lesson's citations are
unverified (no verbatim excerpt). The strict ``>`` means exactly 20% passes."""


def is_verified_excerpt(excerpt: str | None) -> bool:
    """True iff *excerpt* is a non-empty, verbatim-grounding excerpt.

    A present excerpt means the citation genuinely quotes its segment; an
    absent/empty excerpt means it quotes nothing and is unverified.
    """
    return excerpt is not None and excerpt != ""


def grounding_ratio(excerpts) -> tuple[int, int, float]:
    """Return ``(total, unverified, unverified_ratio)`` over an iterable of
    excerpts (each ``str | None``). Ratio is ``0.0`` for empty input.
    """
    total = 0
    unverified = 0
    for ex in excerpts:
        total += 1
        if not is_verified_excerpt(ex):
            unverified += 1
    ratio = (unverified / total) if total else 0.0
    return total, unverified, ratio


def assert_grounding_threshold(
    excerpts,
    lesson_id: str,
    *,
    max_unverified_ratio: float = MAX_UNVERIFIED_RATIO,
) -> None:
    """Raise ``ValueError`` if more than *max_unverified_ratio* of the citations
    are unverified (no verbatim excerpt). The anti-false-verde acceptance gate.
    """
    total, unverified, ratio = grounding_ratio(excerpts)
    if ratio > max_unverified_ratio:
        raise ValueError(
            f"lesson {lesson_id!r}: {unverified}/{total} citations unverified "
            f"({ratio:.0%} > {max_unverified_ratio:.0%} threshold) — "
            f"insufficient verbatim grounding for acceptance"
        )
