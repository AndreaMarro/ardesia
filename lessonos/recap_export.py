"""Lesson Recap Export — DB projection for the Studio recap view (M2-7).

ZERO LLM, pure DB + filesystem projection.  Produces a structured JSON document
with lesson metadata, concepts (capsule-derived), open debts (problematic
concepts), and derived materials (wiki/dispense/teacher_book/vault files).

Schema version is embedded in the output (``recap_schema_version``).  Increment
it when the output schema changes so Studio can detect stale formats.
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path as FsPath
from typing import Any

from lessonos.capsule.assembly import load_capsule
from lessonos.store.base import Store

SCHEMA_VERSION_RECAP = 1

# ---------------------------------------------------------------------------
# Domain schema (frozen dataclass → JSON)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class RecapConcept:
    """A concept appearing in the lesson, with its status and evidence count."""

    name: str
    status: str
    evidence_count: int = 0


@dataclass(frozen=True)
class RecapDebt:
    """An open didactic debt identified for this lesson."""

    kind: str
    description: str


@dataclass(frozen=True)
class RecapDerivedMaterial:
    """A derived material file (wiki, dispensa, teacher_book, vault, …)."""

    kind: str
    path: str
    title: str = ""


@dataclass(frozen=True)
class LessonRecap:
    """Complete recap document for a single lesson (M2-7 schema).

    Produced entirely without LLM calls — pure projection of existing DB and
    filesystem data.
    """

    recap_schema_version: int = SCHEMA_VERSION_RECAP
    lesson_id: str = ""
    title: str = ""
    duration_seconds: int = 0
    concepts: tuple[RecapConcept, ...] = ()
    open_debts: tuple[RecapDebt, ...] = ()
    derived_materials: tuple[RecapDerivedMaterial, ...] = ()


# ---------------------------------------------------------------------------
# Derivation helpers  (ZERO-LLM)
# ---------------------------------------------------------------------------


def _compute_duration(store: Store, lesson_id: str) -> int:
    """Compute lesson duration from segment timestamps.

    Returns ``max(end) - min(start)`` across all segments for *lesson_id*,
    or 0 if there are no segments.
    """
    segs = store.segments_for_lesson(lesson_id)
    if not segs:
        return 0
    starts = [s.start for s in segs]
    ends = [s.end for s in segs]
    return max(ends) - min(starts)


def _extract_concepts(capsule_json: str | None) -> tuple[RecapConcept, ...]:
    """Parse concepts from a serialised Lesson Capsule JSON blob.

    Extracts concept name + status + evidence_count (number of citations).
    Returns empty tuple when capsule is *None* or has no concepts.
    """
    if capsule_json is None:
        return ()

    try:
        data = json.loads(capsule_json)
    except (json.JSONDecodeError, TypeError):
        return ()

    content = data.get("content", {})
    raw_concepts = content.get("concepts", [])
    if not raw_concepts:
        return ()

    result: list[RecapConcept] = []
    for c in raw_concepts:
        name = c.get("name", "")
        status = c.get("status", "")
        citations = c.get("citations", [])
        ev_count = len(citations) if isinstance(citations, list) else 0
        if name and status:
            result.append(RecapConcept(name=name, status=status, evidence_count=ev_count))
    return tuple(result)


def _extract_debts(capsule_json: str | None) -> tuple[RecapDebt, ...]:
    """Derive open didactic debts from a capsule.

    ZERO-LLM rule:
    - Any concept with ``status="problematic"`` → ``unmastered_concept`` debt.
    - If the capsule is *None* or has no problematic concepts → empty debts.
    """
    if capsule_json is None:
        return ()

    try:
        data = json.loads(capsule_json)
    except (json.JSONDecodeError, TypeError):
        return ()

    content = data.get("content", {})
    raw_concepts = content.get("concepts", [])
    if not raw_concepts:
        return ()

    debts: list[RecapDebt] = []
    for c in raw_concepts:
        name = c.get("name", "")
        status = c.get("status", "")
        if name and status == "problematic":
            debts.append(
                RecapDebt(
                    kind="unmastered_concept",
                    description=f"Concetto '{name}' ancora problematico",
                )
            )
    return tuple(debts)


def _is_lesson_file(stem: str, lesson_id: str) -> bool:
    """Check if a filename stem matches a lesson_id (case-insensitive).

    Matches when *stem* equals *lesson_id* or starts with
    ``lesson_id + "_"`` (convention for derived files keyed by teacher or
    lesson name).  Comparison is case-insensitive for portability across
    case-sensitive (Linux) and case-insensitive (macOS APFS) filesystems.

    ZERO-LLM, pure string check.  Prevents substring false-positives like
    ``"andrea" in "alessandro_andrea"``.
    """
    return stem.lower() == lesson_id.lower() or stem.lower().startswith(lesson_id.lower() + "_")


def _scan_derived_materials(derived_dir: str | None, lesson_id: str) -> tuple[RecapDerivedMaterial, ...]:
    """Scan *derived_dir* for material files related to *lesson_id*.

    ZERO-LLM: pure filesystem scan.  Scans subdirectories that match the
    lesson_id (e.g. ``wiki/prima_lezione.md``, ``dispense/andrea.md``,
    ``teacher_book/andrea.md``, ``vault/andrea.md``).
    Uses ``_is_lesson_file`` for safe exact-or-prefix matching (no substring
    false-positives).
    Returns empty tuple when *derived_dir* is *None* or does not exist.
    """
    if derived_dir is None:
        return ()
    root = FsPath(derived_dir)
    if not root.is_dir():
        return ()

    materials: list[RecapDerivedMaterial] = []

    # --- wiki ---
    wiki_dir = root / "wiki"
    if wiki_dir.is_dir():
        for fpath in sorted(wiki_dir.iterdir()):
            if fpath.suffix in (".md", ".txt", ".json") and _is_lesson_file(fpath.stem, lesson_id):
                materials.append(
                    RecapDerivedMaterial(
                        kind="wiki",
                        path=str(fpath),
                        title=fpath.stem,
                    )
                )

    # --- dispense ---
    dispensa_dir = root / "dispense"
    if dispensa_dir.is_dir():
        for fpath in sorted(dispensa_dir.iterdir()):
            if fpath.suffix in (".md", ".txt") and _is_lesson_file(fpath.stem, lesson_id):
                materials.append(
                    RecapDerivedMaterial(
                        kind="dispensa",
                        path=str(fpath),
                        title=fpath.stem,
                    )
                )

    # --- teacher_book ---
    tb_dir = root / "teacher_book"
    if tb_dir.is_dir():
        for fpath in sorted(tb_dir.iterdir()):
            if fpath.suffix == ".md" and _is_lesson_file(fpath.stem, lesson_id):
                materials.append(
                    RecapDerivedMaterial(
                        kind="teacher_book",
                        path=str(fpath),
                        title=fpath.stem,
                    )
                )

    # --- vault ---
    vault_dir = root / "vault"
    if vault_dir.is_dir():
        for fpath in sorted(vault_dir.iterdir()):
            if fpath.suffix in (".md", ".canvas") and _is_lesson_file(fpath.stem, lesson_id):
                materials.append(
                    RecapDerivedMaterial(
                        kind="vault",
                        path=str(fpath),
                        title=fpath.stem,
                    )
                )

    return tuple(materials)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def build_lesson_recap(
    store: Store,
    lesson_id: str,
    *,
    derived_dir: str | None = None,
) -> LessonRecap:
    """Build a full Lesson Recap from the store and (optionally) the filesystem.

    Parameters
    ----------
    store:
        A :class:`Store` with persisted segments, capsules, lessons.
    lesson_id:
        The lesson to recap.
    derived_dir:
        Optional path to the ``derived/`` directory tree (wiki, dispense,
        teacher_book, vault).  When *None*, derived_materials will be empty.

    Returns
    -------
    LessonRecap
        A frozen dataclass matching the M2-7 schema.

    Raises
    ------
    ValueError
        If *lesson_id* does not exist in the store.
    """
    lesson = store.get_lesson(lesson_id)
    if lesson is None:
        raise ValueError(f"Lesson not found: {lesson_id!r}")

    capsule_raw = store.get_capsule(lesson_id)
    duration = _compute_duration(store, lesson_id)
    concepts = _extract_concepts(capsule_raw)
    debts = _extract_debts(capsule_raw)
    materials = _scan_derived_materials(derived_dir, lesson_id)

    title = lesson.title or lesson_id

    return LessonRecap(
        recap_schema_version=SCHEMA_VERSION_RECAP,
        lesson_id=lesson_id,
        title=title,
        duration_seconds=duration,
        concepts=concepts,
        open_debts=debts,
        derived_materials=materials,
    )


def render_recap_json(recap: LessonRecap, file_path: str | os.PathLike[str]) -> str:
    """Serialise a *recap* to pretty-printed JSON and write to *file_path*.

    Returns the JSON string (also written to disk).
    """
    raw: dict[str, Any] = asdict(recap)  # type: ignore[arg-type]
    text = json.dumps(raw, ensure_ascii=False, indent=2, default=str)
    with open(file_path, "w", encoding="utf-8") as fh:
        fh.write(text)
        fh.write("\n")
    return text
