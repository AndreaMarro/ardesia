"""Tests for Lesson Capsule persistence in the store (M2-task5).

The store persists capsules as opaque JSON blobs (no circular dependency —
the store never imports from ``capsule.assembly``). The assembly module
provides ``save=True`` on ``assemble_lesson_capsule`` and a
``load_capsule()`` helper that handles serialisation.

Tests cover:
- Round-trip save/load via assemble(…, save=True)
- Idempotent re-save (overwrite)
- Persistence across store reconnect (disk-backed)
- Missing capsule returns None
"""

from __future__ import annotations

import json
from pathlib import Path as FsPath

import pytest

from lessonos.capsule.assembly import (
    LessonCapsule,
    assemble_lesson_capsule,
    load_capsule,
)
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.llm.router import MockProvider, Router
from lessonos.store.fixture_loader import ingest_lesson_segments
from lessonos.store.sqlite import SQLiteStore

L1 = "l1_derivative_definition"


def _segmentation_prompt(store, lesson_id=L1):
    from lessonos.capsule.segmentation import build_segmentation_prompt

    return build_segmentation_prompt(store.segments_for_lesson(lesson_id))


def _extraction_prompt(store, lesson_id=L1):
    from lessonos.capsule.extraction import build_extraction_prompt

    return build_extraction_prompt(store.segments_for_lesson(lesson_id))


def _make_router(store) -> Router:
    """Mock router returning a predictable capsule for L1."""
    seg_prompt = _segmentation_prompt(store)
    ext_prompt = _extraction_prompt(store)
    seg_payload = [
        {"topic": "definizione", "seg_ids": ["l1s1", "l1s2"]},
        {"topic": "limite", "seg_ids": ["l1s3"]},
    ]
    ext_payload = {
        "concepts": [
            {
                "name": "derivata",
                "status": "introduced",
                "citations": [{"seg_id": "l1s1"}],
            }
        ],
        "exercises": [
            {"prompt": "Calcola f'(x) per f(x)=x^2", "citations": [{"seg_id": "l1s3"}]}
        ],
        "student_questions": [
            {"question": "Cosa succede se h=0?", "citations": [{"seg_id": "l1s2"}]}
        ],
        "homework": [{"task": "Esercizi 1-3", "citations": [{"seg_id": "l1s3"}]}],
    }
    router = Router()
    router.register(
        MockProvider(
            {
                seg_prompt: json.dumps(seg_payload),
                ext_prompt: json.dumps(ext_payload),
            }
        )
    )
    return router


# --- Raw Store round-trip (opaque JSON blob) ---


def test_raw_capsule_save_and_get() -> None:
    store = SQLiteStore()
    store.save_capsule("l1", '{"key": "val"}')
    assert store.get_capsule("l1") == '{"key": "val"}'
    store.close()


def test_raw_capsule_missing_returns_none() -> None:
    store = SQLiteStore()
    assert store.get_capsule("nope") is None
    store.close()


def test_raw_capsule_overwrite_is_idempotent() -> None:
    store = SQLiteStore()
    store.save_capsule("l1", "v1")
    store.save_capsule("l1", "v2")
    assert store.get_capsule("l1") == "v2"
    store.close()


def test_raw_capsule_persists_across_reconnect(tmp_path: FsPath) -> None:
    db = str(tmp_path / "capsules.db")
    s1 = SQLiteStore(db)
    s1.save_capsule("l1", '{"ok": true}')
    s1.close()

    s2 = SQLiteStore(db)
    assert s2.get_capsule("l1") == '{"ok": true}'
    s2.close()


# --- High-level: assemble + save + load ---


def test_assemble_with_save_persists_capsule() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    router = _make_router(store)

    capsule = assemble_lesson_capsule(store, L1, router, save=True)
    assert isinstance(capsule, LessonCapsule)
    assert capsule.lesson_id == L1

    # Reload from store — must match the assembled capsule.
    reloaded = load_capsule(store, L1)
    assert reloaded is not None
    assert reloaded.lesson_id == L1
    assert len(reloaded.timeline) == 2
    assert reloaded.timeline[0].topic == "definizione"
    assert len(reloaded.content.concepts) == 1
    assert reloaded.content.concepts[0].name == "derivata"
    assert len(reloaded.content.exercises) == 1
    assert len(reloaded.content.student_questions) == 1
    assert len(reloaded.content.homework) == 1

    # Grounding: every citation in the reloaded capsule resolves.
    by_id = {s.seg_id: s for s in store.segments_for_lesson(L1)}
    for span in reloaded.timeline:
        for sid in span.seg_ids:
            assert sid in by_id, f"reloaded timeline cites unknown {sid!r}"
    for c in reloaded.content.concepts:
        for cite in c.citations:
            assert cite.seg_id in by_id, f"reloaded concept cites unknown {cite.seg_id!r}"
    store.close()


def test_assemble_without_save_does_not_persist() -> None:
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    router = _make_router(store)

    assemble_lesson_capsule(store, L1, router, save=False)
    assert load_capsule(store, L1) is None
    store.close()


def test_load_capsule_missing_returns_none() -> None:
    store = SQLiteStore()
    assert load_capsule(store, "nonexistent") is None
    store.close()


def test_load_capsule_after_reconnect(tmp_path: FsPath) -> None:
    db = str(tmp_path / "lessonos_capsules.db")
    s1 = SQLiteStore(db)
    ingest_lesson_segments(s1, L1)
    router = _make_router(s1)

    assemble_lesson_capsule(s1, L1, router, save=True)
    s1.close()

    s2 = SQLiteStore(db)
    reloaded = load_capsule(s2, L1)
    assert reloaded is not None
    assert reloaded.lesson_id == L1
    assert len(reloaded.timeline) == 2
    s2.close()


def test_serialised_capsule_has_expected_structure() -> None:
    """The JSON blob stored by the store must have the expected schema."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    router = _make_router(store)

    assemble_lesson_capsule(store, L1, router, save=True)
    raw = store.get_capsule(L1)
    assert raw is not None

    data = json.loads(raw)
    assert "timeline" in data
    assert "content" in data
    assert len(data["timeline"]) == 2
    assert "concepts" in data["content"]
    assert "exercises" in data["content"]
    assert "student_questions" in data["content"]
    assert "homework" in data["content"]
    store.close()


def test_load_frozen_immutability() -> None:
    """A capsule loaded from store must still be frozen."""
    store = SQLiteStore()
    ingest_lesson_segments(store, L1)
    router = _make_router(store)

    assemble_lesson_capsule(store, L1, router, save=True)
    reloaded = load_capsule(store, L1)
    assert reloaded is not None
    with pytest.raises(Exception):  # FrozenInstanceError
        reloaded.lesson_id = "other"  # type: ignore
    store.close()
