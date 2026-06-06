"""Load the synthetic sample-path fixture into a :class:`Store` (M1-task3).

Maps the on-disk fixture (``path.json`` + ``lessons/*.json`` + ``sources/*.txt``)
onto the Path/Lesson/Source domain entities and persists them. This is the
relational load ONLY — transcript/timeline ingest belongs to the capsule
pipeline (M2). The source title is the first line of the source text file
(grounded in the file, never invented).
"""

from __future__ import annotations

import json
from pathlib import Path as FsPath

from lessonos.models.entities import Lesson, Path, Segment, Source
from lessonos.store.base import Store

DEFAULT_FIXTURE_ROOT = (
    FsPath(__file__).resolve().parents[2] / "fixtures" / "sample_path"
)


def load_sample_path(
    store: Store, fixture_root: FsPath = DEFAULT_FIXTURE_ROOT
) -> Path:
    """Read the fixture manifest, persist Source/Lesson/Path, return the Path."""
    manifest = json.loads((fixture_root / "path.json").read_text())

    # Sources first: lessons reference them, so they must already exist.
    for source_id in manifest["sources"]:
        src_file = fixture_root / "sources" / f"{source_id}.txt"
        title = src_file.read_text().splitlines()[0].strip()
        store.save_source(Source(source_id=source_id, title=title, kind="text"))

    for lesson_id in manifest["lessons"]:
        data = json.loads(
            (fixture_root / "lessons" / f"{lesson_id}.json").read_text()
        )
        store.save_lesson(
            Lesson(
                lesson_id=data["lesson_id"],
                path_id=data["path_id"],
                title=data["title"],
                order=data["order"],
                source_id=data.get("source_id"),
            )
        )

    path = Path(
        path_id=manifest["path_id"],
        title=manifest["title"],
        subject=manifest["subject"],
        lesson_ids=tuple(manifest["lessons"]),
        source_ids=tuple(manifest["sources"]),
        synthetic=manifest.get("synthetic", False),
    )
    store.save_path(path)
    return path


def ingest_lesson_segments(
    store: Store, lesson_id: str, fixture_root: FsPath = DEFAULT_FIXTURE_ROOT
) -> tuple[Segment, ...]:
    """Persist a lesson's transcript segments into the store (M2 ingest).

    The transcript is the grounding anchor: every Lesson Capsule citation must
    resolve to one of these ``seg_id`` values (PLAN §13.4). Text is copied
    verbatim from the fixture — never paraphrased — so grounding stays exact.
    """
    data = json.loads(
        (fixture_root / "lessons" / f"{lesson_id}.json").read_text()
    )
    segments = tuple(
        Segment(
            seg_id=seg["seg_id"],
            lesson_id=data["lesson_id"],
            start=seg["start"],
            end=seg["end"],
            text=seg["text"],
        )
        for seg in data["transcript"]
    )
    for segment in segments:
        store.save_segment(segment)
    return segments
