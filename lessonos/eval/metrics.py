"""Groundedness and citation-accuracy metrics (M5, PLAN §22).

Two reusable EvalMetric factories that score any eval result for citation
groundedness and excerpt accuracy:

  - groundedness_metric(store): every Citation.seg_id MUST resolve to a real
    persisted Segment. Score = valid_citations / total_citations.
  - citation_excerpt_accuracy_metric(store): every Citation.excerpt MUST appear
    as a substring within the referenced Segment's text. Score = matching / total.

Both metrics are designed to work with any eval result that contains Citation
objects (LessonCapsule, PathMemory, etc.) by introspecting the result tree.
"""

from __future__ import annotations

from collections.abc import Iterator, Sequence

from lessonos.capsule.extraction import Citation
from lessonos.eval.models import EvalMetric
from lessonos.store.base import Store


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _collect_citations(result) -> list[Citation]:
    """Recursively collect all Citation objects from an eval result.

    Works with:
      - A direct LessonCapsule -> scans content.concepts/exercises/...
      - A PathMemory -> scans concept_graph (ConceptPathEntry has no citations
        at path level, so the main source is capsules if passed)
      - A dict -> scans known keys
      - A list/tuple -> scans elements
      - An object with __dict__ -> scans fields
    """
    from lessonos.capsule.assembly import LessonCapsule
    from lessonos.capsule.extraction import (
        ConceptExtraction,
        ExerciseExtraction,
        HomeworkExtraction,
        LessonContent,
        QuestionExtraction,
    )

    seen: set[int] = set()
    citations: list[Citation] = []

    def _walk(obj) -> None:
        obj_id = id(obj)
        if obj_id in seen:
            return
        seen.add(obj_id)

        if isinstance(obj, Citation):
            citations.append(obj)
        elif isinstance(obj, LessonCapsule):
            _walk(obj.content)
            # TopicSpan seg_ids are not Citation objects — they're plain str
            # So they don't need Citation-level checking
        elif isinstance(obj, LessonContent):
            for c in obj.concepts:
                _walk(c)
            for e in obj.exercises:
                _walk(e)
            for q in obj.student_questions:
                _walk(q)
            for h in obj.homework:
                _walk(h)
        elif isinstance(obj, ConceptExtraction):
            _walk(obj.citations)
        elif isinstance(obj, (ExerciseExtraction, QuestionExtraction, HomeworkExtraction)):
            _walk(obj.citations)
        elif isinstance(obj, dict):
            for v in obj.values():
                _walk(v)
        elif isinstance(obj, (list, tuple)):
            for item in obj:
                _walk(item)
        elif hasattr(obj, "__dataclass_fields__"):
            for field_name in obj.__dataclass_fields__:
                _walk(getattr(obj, field_name))

    _walk(result)
    return citations


def _get_segment_text(store: Store, seg_id: str) -> str | None:
    """Retrieve a segment's text from the store, or None if not found."""
    seg = store.get_segment(seg_id)
    return seg.text if seg is not None else None


# ---------------------------------------------------------------------------
# Metric factories
# ---------------------------------------------------------------------------


def build_groundedness_metric(store: Store, name: str = "groundedness") -> EvalMetric:
    """Build a metric that checks every Citation.seg_id resolves to a real segment.

    Score = valid_citations / total_citations. An empty citation list is a pass
    (score=1.0) with a note — no citations means no data to evaluate, but also
    no violations.

    The metric returns (passed, detail) where passed is True if ALL citations
    resolve (score == 1.0) and False otherwise.
    """

    def _check(result) -> tuple[bool, str]:
        citations = _collect_citations(result)
        if not citations:
            return True, "0 citations to check (score=1.0)"

        valid = 0
        broken: list[str] = []
        for cit in citations:
            text = _get_segment_text(store, cit.seg_id)
            if text is not None:
                valid += 1
            else:
                broken.append(cit.seg_id)

        total = len(citations)
        score = valid / total if total else 1.0
        passed = score == 1.0
        if broken:
            detail = (
                f"score={score:.2f} ({valid}/{total}); "
                f"unresolved seg_ids: {broken}"
            )
        else:
            detail = f"score={score:.2f} ({valid}/{total}) — all citations grounded"

        return passed, detail

    return EvalMetric(
        name=name,
        description="Groundedness: every Citation.seg_id resolves to a persisted Segment.",
        check=_check,
    )


def build_citation_excerpt_accuracy_metric(
    store: Store,
    name: str = "citation_excerpt_accuracy",
) -> EvalMetric:
    """Build a metric that checks each Citation.excerpt appears in the source text.

    Score = matching_excerpts / non_blank_excerpts. Citations with no excerpt
    (``None``, ``""`` or whitespace-only) are skipped: per the T6R grounding
    policy a blank excerpt quotes nothing and is UNVERIFIED, never grounded —
    counting it as a match would inflate the score (a blank string is a
    substring of any text). Only citations that have a non-blank excerpt AND a
    resolved segment are checked.

    The metric returns (passed, detail) where passed is True if ALL checked
    excerpts match (score == 1.0 or no excerpts to check).
    """

    def _check(result) -> tuple[bool, str]:
        citations = _collect_citations(result)
        if not citations:
            return True, "0 citations to check (excerpt accuracy score=1.0)"

        checked = 0
        matching = 0
        mismatches: list[str] = []

        for cit in citations:
            if not cit.excerpt or not cit.excerpt.strip():
                continue  # Skipped: blank excerpt (None/""/whitespace) = nothing to verify
            seg_text = _get_segment_text(store, cit.seg_id)
            if seg_text is None:
                # Groundedness failure is not our job — skip ungrounded citations
                continue
            checked += 1
            if cit.excerpt in seg_text:
                matching += 1
            else:
                mismatches.append(
                    f"{cit.seg_id}: excerpt={cit.excerpt!r} not in segment text"
                )

        if checked == 0:
            return True, "0 excerpts to validate (citation_excerpt_accuracy score=1.0)"

        score = matching / checked if checked else 1.0
        passed = score == 1.0
        if mismatches:
            detail = (
                f"score={score:.2f} ({matching}/{checked}); "
                f"mismatches: {'; '.join(mismatches)}"
            )
        else:
            detail = f"score={score:.2f} ({matching}/{checked}) — all excerpts match source text"

        return passed, detail

    return EvalMetric(
        name=name,
        description="Citation excerpt accuracy: each excerpt appears as a substring in the referenced Segment's text.",
        check=_check,
    )
