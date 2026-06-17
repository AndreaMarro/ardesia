"""Tests per Course Foundry P0a: schema + folder_loader + fixture.

TDD: test first, poi implementazione. Mock quando serve, ma qui la maggior
parte dei test usa la fixture reale su disco (integrazione leggera).
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pytest

from lessonos.course import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
    build_course_blueprint,
    load_course_folder,
)

# ── Fixture: corso valido su disco ──────────────────────────────────────


@pytest.fixture
def valid_course_folder(tmp_path: Path) -> Path:
    """Crea una cartella corso temporanea valida con 2 lezioni."""
    root = tmp_path / "my_course"
    root.mkdir()
    (root / "lessons" / "l1").mkdir(parents=True)
    (root / "lessons" / "l2").mkdir(parents=True)
    (root / "sources").mkdir()
    (root / "sources" / "handout.md").write_text("# Handout", encoding="utf-8")
    (root / "sources" / "slides.md").write_text("# Slides", encoding="utf-8")
    manifest = {
        "title": "Analisi Matematica",
        "lessons": [
            {"lesson_id": "l1", "title": "Limiti", "order": 1, "source_ids": ["handout"]},
            {"lesson_id": "l2", "title": "Derivate", "order": 2, "source_ids": ["handout", "slides"]},
        ],
        "sources": [
            {"source_id": "handout", "filename": "handout.md", "source_type": "markdown"},
            {"source_id": "slides", "filename": "slides.md", "source_type": "markdown"},
        ],
    }
    (root / "course.json").write_text(json.dumps(manifest), encoding="utf-8")
    return root


# ── CourseLessonRef ─────────────────────────────────────────────────────


class TestCourseLessonRef:
    def test_valid_lesson(self) -> None:
        lesson = CourseLessonRef(lesson_id="l1", title="Limiti", order=1)
        assert lesson.lesson_id == "l1"
        assert lesson.title == "Limiti"
        assert lesson.order == 1
        assert lesson.source_ids == ()

    def test_with_source_ids(self) -> None:
        lesson = CourseLessonRef(
            lesson_id="l1", title="Limiti", order=1, source_ids=("handout",)
        )
        assert lesson.source_ids == ("handout",)

    def test_empty_lesson_id_raises(self) -> None:
        with pytest.raises(ValueError, match="lesson_id must be non-empty"):
            CourseLessonRef(lesson_id="", title="Limiti", order=1)

    def test_empty_title_raises(self) -> None:
        with pytest.raises(ValueError, match="title must be non-empty"):
            CourseLessonRef(lesson_id="l1", title="", order=1)

    def test_order_less_than_one_raises(self) -> None:
        with pytest.raises(ValueError, match="order must be >= 1"):
            CourseLessonRef(lesson_id="l1", title="Limiti", order=0)

    def test_frozen(self) -> None:
        lesson = CourseLessonRef(lesson_id="l1", title="Limiti", order=1)
        with pytest.raises(AttributeError):
            lesson.lesson_id = "l2"  # type: ignore[misc]


# ── CourseSourceRef ─────────────────────────────────────────────────────


class TestCourseSourceRef:
    def test_valid_source(self) -> None:
        src = CourseSourceRef(source_id="h", filename="handout.md", source_type="markdown")
        assert src.source_id == "h"
        assert src.filename == "handout.md"
        assert src.source_type == "markdown"

    def test_default_source_type(self) -> None:
        src = CourseSourceRef(source_id="h", filename="handout.md")
        assert src.source_type == "text"

    def test_empty_source_id_raises(self) -> None:
        with pytest.raises(ValueError, match="source_id must be non-empty"):
            CourseSourceRef(source_id="", filename="h.md")

    def test_empty_filename_raises(self) -> None:
        with pytest.raises(ValueError, match="filename must be non-empty"):
            CourseSourceRef(source_id="h", filename="")

    def test_empty_source_type_raises(self) -> None:
        with pytest.raises(ValueError, match="source_type must be non-empty"):
            CourseSourceRef(source_id="h", filename="h.md", source_type="")


# ── ModuleBlueprint ──────────────────────────────────────────────────────


class TestModuleBlueprint:
    def test_valid_module(self) -> None:
        mod = ModuleBlueprint(
            title="Limiti e derivate",
            lesson_ids=("l1", "l2"),
            objectives=("Capire i limiti", "Calcolare derivate"),
        )
        assert mod.title == "Limiti e derivate"
        assert mod.lesson_ids == ("l1", "l2")
        assert mod.objectives == ("Capire i limiti", "Calcolare derivate")

    def test_empty_objectives(self) -> None:
        mod = ModuleBlueprint(title="Solo titolo")
        assert mod.objectives == ()
        assert mod.lesson_ids == ()

    def test_empty_title_raises(self) -> None:
        with pytest.raises(ValueError, match="title must be non-empty"):
            ModuleBlueprint(title="")


# ── CourseBlueprint ─────────────────────────────────────────────────────


class TestCourseBlueprint:
    def test_valid_blueprint(self) -> None:
        mod = ModuleBlueprint(title="M1", lesson_ids=("l1",))
        bp = CourseBlueprint(
            title="Analisi",
            modules=(mod,),
            audience="studenti universitari",
            level="base",
            source_lessons=("l1",),
        )
        assert bp.title == "Analisi"
        assert len(bp.modules) == 1
        assert bp.source_lessons == ("l1",)

    def test_empty_title_raises(self) -> None:
        with pytest.raises(ValueError, match="title must be non-empty"):
            CourseBlueprint(title="")


# ── CourseFolder ─────────────────────────────────────────────────────────


class TestCourseFolder:
    def test_valid_course_folder(self) -> None:
        lesson = CourseLessonRef(lesson_id="l1", title="Limiti", order=1)
        src = CourseSourceRef(source_id="h", filename="h.md")
        cf = CourseFolder(
            title="Analisi",
            folder_path="/tmp/course",
            lessons=(lesson,),
            sources=(src,),
        )
        assert cf.title == "Analisi"
        assert cf.lessons[0].lesson_id == "l1"
        assert cf.sources[0].source_id == "h"

    def test_empty_title_raises(self) -> None:
        with pytest.raises(ValueError, match="title must be non-empty"):
            CourseFolder(title="", folder_path="/tmp/c")

    def test_empty_folder_path_raises(self) -> None:
        with pytest.raises(ValueError, match="folder_path must be non-empty"):
            CourseFolder(title="C", folder_path="")

    def test_duplicate_lesson_id_raises(self) -> None:
        lesson = CourseLessonRef(lesson_id="l1", title="T", order=1)
        duplicate = CourseLessonRef(lesson_id="l1", title="T2", order=2)
        with pytest.raises(ValueError, match="duplicate lesson_id"):
            CourseFolder(
                title="C",
                folder_path="/tmp/c",
                lessons=(lesson, duplicate),
            )

    def test_duplicate_source_id_raises(self) -> None:
        src = CourseSourceRef(source_id="h", filename="h.md")
        dup = CourseSourceRef(source_id="h", filename="h2.md")
        with pytest.raises(ValueError, match="duplicate source_id"):
            CourseFolder(
                title="C",
                folder_path="/tmp/c",
                sources=(src, dup),
            )

    def test_non_increasing_order_raises(self) -> None:
        l1 = CourseLessonRef(lesson_id="l1", title="T1", order=1)
        l2 = CourseLessonRef(lesson_id="l2", title="T2", order=1)  # stesso ordine
        with pytest.raises(ValueError, match="non-increasing lesson order"):
            CourseFolder(
                title="C",
                folder_path="/tmp/c",
                lessons=(l1, l2),
            )

    def test_reversed_order_raises(self) -> None:
        l1 = CourseLessonRef(lesson_id="l1", title="T1", order=2)
        l2 = CourseLessonRef(lesson_id="l2", title="T2", order=1)  # ordine invertito
        with pytest.raises(ValueError, match="non-increasing"):
            CourseFolder(
                title="C",
                folder_path="/tmp/c",
                lessons=(l1, l2),
            )

    def test_frozen(self) -> None:
        cf = CourseFolder(title="C", folder_path="/tmp/c")
        with pytest.raises(AttributeError):
            cf.title = "D"  # type: ignore[misc]


# ── Folder Loader (integrazione su fixture su disco) ────────────────────


class TestLoadCourseFolder:
    def test_load_valid_course(self, valid_course_folder: Path) -> None:
        course = load_course_folder(str(valid_course_folder))
        assert course.title == "Analisi Matematica"
        assert len(course.lessons) == 2
        assert len(course.sources) == 2
        assert course.lessons[0].lesson_id == "l1"
        assert course.lessons[0].order == 1
        assert course.lessons[1].lesson_id == "l2"
        assert course.lessons[1].order == 2
        # Lezioni in ordine crescente
        assert course.lessons[0].order < course.lessons[1].order

    def test_load_source_ids_resolved(self, valid_course_folder: Path) -> None:
        course = load_course_folder(str(valid_course_folder))
        # l2 referenzia handout + slides
        l2 = next(l for l in course.lessons if l.lesson_id == "l2")
        assert "handout" in l2.source_ids
        assert "slides" in l2.source_ids

    def test_lessons_have_source_refs(self, valid_course_folder: Path) -> None:
        course = load_course_folder(str(valid_course_folder))
        for lesson in course.lessons:
            for sid in lesson.source_ids:
                assert any(s.source_id == sid for s in course.sources)

    def test_load_with_modules(self, valid_course_folder: Path) -> None:
        # Aggiunge moduli al manifest
        root = valid_course_folder
        manifest_path = root / "course.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["modules"] = [
            {
                "title": "Fondamenti",
                "lesson_ids": ["l1"],
                "objectives": ["Capire i limiti"],
            },
            {
                "title": "Calcolo",
                "lesson_ids": ["l2"],
                "objectives": ["Calcolare derivate"],
            },
        ]
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        course = load_course_folder(str(root))
        assert len(course.modules) == 2
        assert course.modules[0].title == "Fondamenti"
        assert course.modules[1].lesson_ids == ("l2",)
        assert course.modules[1].objectives == ("Calcolare derivate",)

    def test_missing_folder_raises(self) -> None:
        with pytest.raises(ValueError, match="course folder not found"):
            load_course_folder("/tmp/nonexistent_course_12345")

    def test_missing_course_json_raises(self, tmp_path: Path) -> None:
        empty = tmp_path / "empty"
        empty.mkdir()
        with pytest.raises(ValueError, match="course.json not found"):
            load_course_folder(str(empty))

    def test_missing_source_file_raises(self, tmp_path: Path) -> None:
        root = tmp_path / "bad_course"
        root.mkdir()
        (root / "lessons" / "l1").mkdir(parents=True)
        (root / "sources").mkdir()
        manifest = {
            "title": "Bad",
            "lessons": [
                {"lesson_id": "l1", "title": "T1", "order": 1, "source_ids": ["missing"]},
            ],
            "sources": [
                {"source_id": "missing", "filename": "notfound.md", "source_type": "text"},
            ],
        }
        (root / "course.json").write_text(json.dumps(manifest), encoding="utf-8")
        with pytest.raises(ValueError, match="source file not found"):
            load_course_folder(str(root))

    def test_unknown_source_ref_raises(self, tmp_path: Path) -> None:
        root = tmp_path / "bad_ref"
        root.mkdir()
        (root / "lessons" / "l1").mkdir(parents=True)
        (root / "sources").mkdir()
        (root / "sources" / "h.md").write_text("# H", encoding="utf-8")
        manifest = {
            "title": "BadRef",
            "lessons": [
                {
                    "lesson_id": "l1",
                    "title": "T1",
                    "order": 1,
                    "source_ids": ["ghost_source"],
                },
            ],
            "sources": [
                {"source_id": "h", "filename": "h.md", "source_type": "text"},
            ],
        }
        (root / "course.json").write_text(json.dumps(manifest), encoding="utf-8")
        with pytest.raises(ValueError, match="unknown source_id"):
            load_course_folder(str(root))

    def test_module_with_unknown_lesson_id_raises(self, tmp_path: Path) -> None:
        root = tmp_path / "bad_module_ref"
        root.mkdir()
        (root / "lessons" / "l1").mkdir(parents=True)
        (root / "sources").mkdir()
        (root / "sources" / "h.md").write_text("# H", encoding="utf-8")
        manifest = {
            "title": "BadModule",
            "lessons": [
                {"lesson_id": "l1", "title": "T1", "order": 1, "source_ids": []},
            ],
            "sources": [
                {"source_id": "h", "filename": "h.md", "source_type": "text"},
            ],
            "modules": [
                {
                    "title": "Ghost Modulo",
                    "lesson_ids": ["ghost_lesson"],
                }
            ],
        }
        (root / "course.json").write_text(json.dumps(manifest), encoding="utf-8")
        with pytest.raises(ValueError, match="unknown lesson_id.*ghost_lesson"):
            load_course_folder(str(root))


# ── CourseBlueprint Builder ──────────────────────────────────────────────


class TestBuildCourseBlueprint:
    def test_build_from_course_with_modules(self, valid_course_folder: Path) -> None:
        course = load_course_folder(str(valid_course_folder))
        # Nessun modulo nel manifest base
        bp = build_course_blueprint(course)
        assert bp.title == "Analisi Matematica"
        # Fallback: modulo unico
        assert len(bp.modules) == 1
        assert bp.modules[0].title == bp.title
        assert set(bp.modules[0].lesson_ids) == {"l1", "l2"}
        assert set(bp.source_lessons) == {"l1", "l2"}

    def test_build_with_explicit_modules(self, valid_course_folder: Path) -> None:
        root = valid_course_folder
        manifest_path = root / "course.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["modules"] = [
            {"title": "M1", "lesson_ids": ["l1"]},
            {"title": "M2", "lesson_ids": ["l2"]},
        ]
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        course = load_course_folder(str(root))
        bp = build_course_blueprint(course)
        assert len(bp.modules) == 2
        assert bp.modules[0].title == "M1"
        assert bp.modules[1].lesson_ids == ("l2",)
        assert bp.source_lessons == ("l1", "l2")


# ── Integrazione: fixture sample_course reale su disco ──────────────────


SAMPLE_COURSE_PATH = "fixtures/sample_course"


class TestSampleCourseFixture:
    def test_sample_course_loads(self) -> None:
        """La fixture sample_course deve caricarsi senza errori."""
        course = load_course_folder(SAMPLE_COURSE_PATH)
        assert course.title == "Calcolo 2 — Integrali e ODE"
        assert len(course.lessons) == 3
        assert len(course.sources) == 3

    def test_sample_course_lessons_ordered(self) -> None:
        course = load_course_folder(SAMPLE_COURSE_PATH)
        orders = [l.order for l in course.lessons]
        assert orders == [1, 2, 3]

    def test_sample_course_lesson_ids(self) -> None:
        course = load_course_folder(SAMPLE_COURSE_PATH)
        ids = [l.lesson_id for l in course.lessons]
        assert ids == ["l1_derivatives", "l2_integrals", "l3_differential_equations"]

    def test_sample_course_source_files_exist(self) -> None:
        course = load_course_folder(SAMPLE_COURSE_PATH)
        for src in course.sources:
            filepath = f"{SAMPLE_COURSE_PATH}/sources/{src.filename}"
            assert Path(filepath).is_file(), f"{filepath} not found"

    def test_sample_course_lesson_source_refs(self) -> None:
        course = load_course_folder(SAMPLE_COURSE_PATH)
        known_src_ids = {s.source_id for s in course.sources}
        for lesson in course.lessons:
            for sid in lesson.source_ids:
                assert sid in known_src_ids, (
                    f"lesson {lesson.lesson_id} refs unknown source {sid}"
                )
