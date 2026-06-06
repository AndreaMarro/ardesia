"""M1-task3: load the sample-path fixture into the store and verify integrity.

Loads Path + 3 Lessons + Source from the real fixture, then RE-READS every
entity back out of a fresh SQLiteStore and checks referential integrity:
the path lists exactly the stored lessons, the lessons come back in order, and
each lesson's source_id resolves to a source that actually exists in the store.
A dangling reference here would mean the loader fabricated a link.
"""

from __future__ import annotations

from lessonos.store import SQLiteStore, load_sample_path


def _fresh_store() -> SQLiteStore:
    return SQLiteStore(":memory:")


def test_load_persists_path_with_three_lessons() -> None:
    store = _fresh_store()
    returned = load_sample_path(store)

    path = store.get_path(returned.path_id)
    assert path is not None
    assert path.path_id == "path_calc_101"
    assert path.subject == "matematica"
    assert path.synthetic is True
    assert path.lesson_ids == (
        "l1_derivative_definition",
        "l2_derivative_rules",
        "l3_integral_intro",
    )
    store.close()


def test_lessons_reread_in_order() -> None:
    store = _fresh_store()
    path = load_sample_path(store)

    lessons = store.lessons_for_path(path.path_id)
    assert [l.lesson_id for l in lessons] == list(path.lesson_ids)
    assert [l.order for l in lessons] == [1, 2, 3]  # ordered, not insertion-luck
    store.close()


def test_referential_integrity_lessons_point_to_existing_entities() -> None:
    store = _fresh_store()
    path = load_sample_path(store)

    stored_lesson_ids = {l.lesson_id for l in store.lessons_for_path(path.path_id)}
    # Every id the path advertises is actually persisted as a lesson.
    assert set(path.lesson_ids) == stored_lesson_ids

    for lesson_id in path.lesson_ids:
        lesson = store.get_lesson(lesson_id)
        assert lesson is not None
        assert lesson.path_id == path.path_id
        # The cited source resolves to a real, stored Source (no dangling ref).
        assert lesson.source_id is not None
        assert store.get_source(lesson.source_id) is not None
    store.close()


def test_source_title_is_grounded_in_file_first_line() -> None:
    store = _fresh_store()
    path = load_sample_path(store)

    assert path.source_ids == ("calculus_primer",)
    source = store.get_source("calculus_primer")
    assert source is not None
    # Title is taken from the source file, not invented.
    assert source.title == "Calculus Primer (synthetic source — FAKE content for tests)"
    assert source.kind == "text"
    store.close()


def test_load_is_idempotent() -> None:
    store = _fresh_store()
    load_sample_path(store)
    load_sample_path(store)  # INSERT OR REPLACE → no duplicates, no error

    path = store.get_path("path_calc_101")
    assert path is not None
    assert len(store.lessons_for_path(path.path_id)) == 3
    store.close()
