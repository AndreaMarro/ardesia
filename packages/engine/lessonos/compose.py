"""Single composition root for the inspectable lesson vertical (H1).

One explicit use case reusing the real entry points, in identity-first
order:

    bundle file (resolved against the CALLER cwd, never chdir here)
      -> read_bundle: validated acquisition, read exactly once
      -> project digest from the SAME acquisition (pure: no store
         writes, no router calls); malformed or foreign snapshots fail
         here, before any avoidable effect
      -> ingest_bundle: segments + capsule (persists; no dry-run mode)
      -> generate_lesson_summary(digest=...): inspectable SummaryPack

PDF export stays an explicit caller-side step AFTER inspection:
this module never calls the PDF exporter (no automatic publishing
before human review).

Snapshot presence semantics are preserved, never flattened:
``None`` (bundle carries no snapshot) -> digest ``None``;
``""`` (present but empty) -> available-empty digest (renders no
sections; byte-identity with the no-digest output holds).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from lessonos.ingest.bundle import ingest_bundle, read_bundle
from lessonos.ingest.lessonos_snapshot import (
    LessonOsStudyDigest,
    project_lessonos_study_digest,
)
from lessonos.summarizer import SummaryPack, generate_lesson_summary


@dataclass(frozen=True)
class LessonMaterial:
    """Inspectable result of the vertical: identity, facts, and pack."""

    lesson_id: str
    capsule: object
    digest: LessonOsStudyDigest | None
    pack: SummaryPack


def compose_lesson_material(
    bundle_path: str | Path,
    lesson_id: str,
    *,
    store,
    router,
    provider: str = "mock",
    model: str | None = None,
    output_dir: str = "",
) -> LessonMaterial:
    """Compose segments, capsule, digest, and SummaryPack for one lesson.

    Args:
        bundle_path: ``.lesson`` bundle file. Relative paths resolve
            against the caller working directory BEFORE anything else;
            this function never changes directory (``uv`` project
            resolution and cwd belong to the caller, not the library).
        lesson_id: Canonical lesson identity. Must match the bundle
            manifest and the snapshot rows: mismatches raise, nothing
            is silently renamed.
        store: Persistence layer (segments/capsule land here).
        router: LLM router (mock/spy in tests; real providers only
            with explicit owner configuration, never by default).
        provider: Router provider name.
        model: Optional model override.
        output_dir: If set, the summary markdown is also written there.

    Returns:
        LessonMaterial with the persisted capsule, the projected
        digest (or None), and the inspectable SummaryPack.

    Raises:
        FileNotFoundError: Bundle file does not exist.
        ValueError: Invalid bundle, malformed snapshot, snapshot from
            another lesson, or lesson identity mismatch.
    """
    resolved = Path(bundle_path)
    if not resolved.is_absolute():
        resolved = Path.cwd() / resolved
    if not resolved.is_file():
        raise FileNotFoundError(f"lesson bundle not found: {bundle_path}")

    contents = read_bundle(str(resolved))
    if contents.manifest is not None and contents.manifest.get("lessonId") != lesson_id:
        raise ValueError(
            f"bundle manifest lessonId {contents.manifest.get('lessonId')!r} "
            f"does not match requested lesson {lesson_id!r}"
        )

    snapshot = contents.lessonos_events_jsonl
    digest: LessonOsStudyDigest | None = None
    if snapshot is not None:
        # Pure projection BEFORE any store write or router call: a bad
        # snapshot fails here with zero avoidable effects.
        digest = project_lessonos_study_digest(snapshot, lesson_id)

    _, capsule = ingest_bundle(
        str(resolved), store, lesson_id, router=router,
        provider=provider, model=model,
    )
    pack = generate_lesson_summary(
        store, capsule, router, output_dir=output_dir,
        provider=provider, model=model, digest=digest,
    )
    return LessonMaterial(
        lesson_id=lesson_id, capsule=capsule, digest=digest, pack=pack,
    )
