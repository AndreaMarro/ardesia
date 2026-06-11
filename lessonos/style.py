"""StyleProfile: ZERO-LLM derivation of a teacher's pedagogical style (M1-4).

Extracts measurable, deterministic style metrics from the teacher's aggregated
graph (TeacherBook) and raw segment data. These metrics drive the tone and
structure of the dispensas (M1-4 dispensa.py) — purely mechanical, no LLM call.

Every metric is:
  * Derived from already-computed TeacherBook fields or simple segment counts
  * Fully deterministic (same store + teacher_id → same StyleProfile)
  * Testable byte-for-byte in unit tests with mocked store data
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass

from lessonos.capsule.assembly import LessonCapsule, load_capsule
from lessonos.store.base import Store
from lessonos.teacher_book import build_teacher_book

# ── Filler/tic detection  ──────────────────────────────────────────────

# Approximate Italian filler words and informal tics. These are checked as
# whitespace-delimited or surrounded by punctuation — case-insensitive, no
# substring matches on partial words.
_FILLER_WORDS: frozenset[str] = frozenset({
    "un attimino", "diciamo", "praticamente", "fondamentalmente",
    "in pratica", "insomma", "ecco", "allora", "cioè", "c\'è",
})

# Common academic register markers (formal).
_FORMAL_MARKERS: frozenset[str] = frozenset({
    "pertanto", "dunque", "quindi", "ovvero", "ossia", "nonché",
    "conseguentemente", "tuttavia", "inoltre", "difatti",
})


def _register_from_segments(
    segment_texts: list[str],
) -> str:
    """Heuristic register detection from segment text content.

    Counts filler-word occurrences vs formal-marker occurrences per 100
    whitespace-delimited tokens. Returns one of ``"colloquiale"``,
    ``"formale"``, or ``"misto"``.

    A teacher is "colloquiale" when filler density >= 2× formal density;
    "formale" when the reverse holds; else "misto".
    """
    filler_count = 0
    formal_count = 0
    total_tokens = 0

    for text in segment_texts:
        if not text:
            continue
        # Normalise: lower-case, collapse whitespace
        clean = text.lower()
        tokens = clean.split()
        total_tokens += len(tokens)

        # Count fillers (multi-word phrases checked against the joined lower text)
        for fw in _FILLER_WORDS:
            filler_count += clean.count(fw)
        for fm in _FORMAL_MARKERS:
            formal_count += clean.count(fm)

    if total_tokens == 0:
        return "misto"

    filler_density = filler_count / total_tokens * 1000  # per 1000 tokens
    formal_density = formal_count / total_tokens * 1000

    if filler_density >= 2 * formal_density and filler_density > 1.0:
        return "colloquiale"
    if formal_density >= 2 * filler_density and formal_density > 1.0:
        return "formale"
    return "misto"


def _extract_tics(
    segment_texts: list[str],
    *,
    min_occurrences: int = 3,
    max_tics: int = 5,
    min_word_length: int = 5,
) -> tuple[str, ...]:
    """Extract top-*max_tics* repeated expressions (n-grams, n=1..3).

    Filters out stopwords and very short tokens. Returns sorted tuple of
    *(expression, count)* formatted strings or just expression strings.
    """
    stopwords: frozenset[str] = frozenset({
        "il", "lo", "la", "i", "gli", "le", "un", "uno", "una",
        "del", "dello", "della", "dei", "degli", "delle", "di", "a", "da",
        "in", "con", "su", "per", "tra", "fra", "che", "e", "o", "ma",
        "non", "si", "ci", "ne", "mi", "ti", "vi", "lo", "là", "li",
        "è", "sono", "ha", "ho", "hai", "hanno", "sia", "se", "c'", "più",
        "molto", "tanto", "poi", "dopo", "prima", "solo", "anche", "qui",
        "questo", "quella", "quello", "questa", "quelle", "quelli",
    })

    # Build n-gram counter (n=1,2,3) from all segment texts
    counter: Counter[str] = Counter()
    for text in segment_texts:
        if not text:
            continue
        clean = text.lower()
        words = clean.split()

        # Unigrams (filtered)
        for w in words:
            w_clean = w.strip(".,!?;:()[]\"\"''")
            if len(w_clean) >= min_word_length and w_clean not in stopwords:
                counter[w_clean] += 1

        # Bigrams
        for i in range(len(words) - 1):
            bigram = " ".join(words[i : i + 2])
            # Check both words have content
            w1 = words[i].strip(".,!?;:()[]\"\"''")
            w2 = words[i + 1].strip(".,!?;:()[]\"\"''")
            if len(w1) >= 3 and len(w2) >= 3 and w1 not in stopwords and w2 not in stopwords:
                counter[bigram] += 1

        # Trigrams
        for i in range(len(words) - 2):
            trigram = " ".join(words[i : i + 3])
            w1 = words[i].strip(".,!?;:()[]\"\"''")
            w2 = words[i + 1].strip(".,!?;:()[]\"\"''")
            w3 = words[i + 2].strip(".,!?;:()[]\"\"''")
            if (
                len(w1) >= 3 and len(w2) >= 3 and len(w3) >= 3
                and w1 not in stopwords and w2 not in stopwords and w3 not in stopwords
            ):
                counter[trigram] += 1

    # Filter by min_occurrences, exclude single-letter remnants
    filtered = {
        expr: count
        for expr, count in counter.items()
        if count >= min_occurrences and len(expr) >= min_word_length
    }

    # Sort by count descending, then alphabetically, take top max_tics
    sorted_tics = sorted(filtered.keys(), key=lambda e: (-filtered[e], e))
    return tuple(sorted_tics[:max_tics])


def _count_text_words(segment_texts: list[str]) -> int:
    """Count whitespace-delimited tokens across all segment texts."""
    total = 0
    for text in segment_texts:
        if text:
            total += len(text.split())
    return total


# ── StyleProfile  ──────────────────────────────────────────────────────


@dataclass(frozen=True)
class StyleProfile:
    """Deterministic pedagogical style profile for a teacher (M1-4).

    All fields are derived mechanically from the TeacherBook + raw segment
    data — no LLM call involved. The profile drives the tone, structure, and
    emphasis of the generated dispensa (dispensa.py).
    """

    teacher_id: str
    exercise_density: float
    question_density: float
    prereq_explicitness: float
    concept_granularity: float
    registro: str
    tics: tuple[str, ...]


# ── Derivation  ────────────────────────────────────────────────────────


def derive_style_profile(
    store: Store,
    teacher_id: str,
) -> StyleProfile:
    """Derive a ``StyleProfile`` for *teacher_id* from persisted data.

    Args:
        store: Persistence layer with ``get_segment``, ``paths_for_teacher``.
        teacher_id: The teacher to profile.

    Returns:
        A fully deterministic ``StyleProfile``.

    Raises:
        ValueError: If the teacher has no data (no paths, no capsules).
    """
    # 1. Load TeacherBook (aggregated graph metrics)
    book = build_teacher_book(store, teacher_id)

    if book.total_concepts == 0:
        raise ValueError(f"teacher {teacher_id!r} has zero concepts — cannot derive style profile")

    # 2. Load capsules for exercise/question counts
    # We need paths to get lesson_ids. load all capsules for this teacher.
    paths = store.paths_for_teacher(teacher_id)
    if not paths:
        raise ValueError(f"teacher {teacher_id!r} has no paths")

    all_lesson_ids: set[str] = set()
    for pth in paths:
        all_lesson_ids.update(pth.lesson_ids)

    capsules: list[LessonCapsule] = []
    segment_texts: list[str] = []
    total_exercises = 0
    total_questions = 0

    for lid in sorted(all_lesson_ids):
        cap = load_capsule(store, lid)
        if cap is None:
            continue
        capsules.append(cap)
        total_exercises += len(cap.content.exercises)
        total_questions += len(cap.content.student_questions)

        # Collect segment texts for style analysis
        for conc in cap.content.concepts:
            for cit in conc.citations:
                seg = store.get_segment(cit.seg_id)
                if seg is not None and seg.text:
                    segment_texts.append(seg.text)

    if not capsules:
        raise ValueError(f"teacher {teacher_id!r} has no capsules — cannot derive style profile")

    # 3. Compute metrics
    exercise_density = round(total_exercises / book.total_concepts, 4)
    question_density = round(total_questions / len(segment_texts), 4) if segment_texts else 0.0
    prereq_explicitness = round(len(book.prerequisites) / book.total_concepts, 4) if book.total_concepts else 0.0
    total_words = _count_text_words(segment_texts)
    concept_granularity = round(book.total_concepts / (total_words / 1000), 4) if total_words else 0.0
    registro = _register_from_segments(segment_texts)
    tics = _extract_tics(segment_texts)

    return StyleProfile(
        teacher_id=teacher_id,
        exercise_density=exercise_density,
        question_density=question_density,
        prereq_explicitness=prereq_explicitness,
        concept_granularity=concept_granularity,
        registro=registro,
        tics=tics,
    )
