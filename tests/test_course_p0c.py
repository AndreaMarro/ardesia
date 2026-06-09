"""Tests per P0c: CourseBlueprint builder con content_atom_ids (COORDINATION.md §16).

Test categories:
  1. build_course_blueprint backward compatibility (no atoms)
  2. build_course_blueprint with atoms: content_atom_ids assigned correctly
  3. Edge cases: empty atoms, unknown lesson_ids, multiple modules
  4. Immutability check
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from lessonos.capsule.extraction import Citation
from lessonos.course import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
    build_course_blueprint,
    load_course_folder,
)
from lessonos.course.atoms import ContentAtom
from lessonos.course.schema import CourseFolder


# ── Helpers ────────────────────────────────────────────────────────────────


def _make_atom(
    atom_id: str = "l1/definition/0",
    atom_type: str = "definition",
    lesson_id: str = "l1",
    body: str = "Derivative definition",
) -> ContentAtom:
    return ContentAtom(
        atom_id=atom_id,
        atom_type=atom_type,
        lesson_id=lesson_id,
        body=body,
        source_refs=(Citation(seg_id="l1s1", excerpt="Derivative"),),
    )


@pytest.fixture
def course_folder_no_modules() -> CourseFolder:
    """CourseFolder senza moduli (fallback single module)."""
    return CourseFolder(
        title="Test Course",
        folder_path="/tmp/test",
        lessons=(
            CourseLessonRef(lesson_id="l1", title="Lezione 1", order=1),
            CourseLessonRef(lesson_id="l2", title="Lezione 2", order=2),
        ),
        sources=(),
        modules=(),
    )


@pytest.fixture
def course_folder_with_modules() -> CourseFolder:
    """CourseFolder con 2 moduli espliciti."""
    return CourseFolder(
        title="Test Course",
        folder_path="/tmp/test",
        lessons=(
            CourseLessonRef(lesson_id="l1", title="Lezione 1", order=1),
            CourseLessonRef(lesson_id="l2", title="Lezione 2", order=2),
        ),
        sources=(),
        modules=(
            ModuleBlueprint(
                title="Modulo A",
                lesson_ids=("l1",),
                objectives=("Objective A1",),
            ),
            ModuleBlueprint(
                title="Modulo B",
                lesson_ids=("l2",),
                objectives=("Objective B1",),
            ),
        ),
    )


# ── Backward compatibility ────────────────────────────────────────────────


class TestBackwardCompat:
    """build_course_blueprint senza atoms deve funzionare come prima."""

    def test_no_modules_creates_fallback(self, course_folder_no_modules: CourseFolder) -> None:
        bp = build_course_blueprint(course_folder_no_modules)
        assert bp.title == "Test Course"
        assert len(bp.modules) == 1
        assert bp.modules[0].title == bp.title
        assert set(bp.modules[0].lesson_ids) == {"l1", "l2"}
        # content_atom_ids vuoto (default)
        assert bp.modules[0].content_atom_ids == ()

    def test_with_modules_uses_existing(self, course_folder_with_modules: CourseFolder) -> None:
        bp = build_course_blueprint(course_folder_with_modules)
        assert len(bp.modules) == 2
        assert bp.modules[0].title == "Modulo A"
        assert bp.modules[1].title == "Modulo B"
        assert bp.modules[0].content_atom_ids == ()
        assert bp.modules[1].content_atom_ids == ()

    def test_source_lessons_in_order(self, course_folder_no_modules: CourseFolder) -> None:
        bp = build_course_blueprint(course_folder_no_modules)
        assert bp.source_lessons == ("l1", "l2")

    def test_empty_course(self) -> None:
        cf = CourseFolder(title="Empty", folder_path="/tmp/e")
        bp = build_course_blueprint(cf)
        assert bp.source_lessons == ()


# ── With atoms ─────────────────────────────────────────────────────────────


class TestWithAtoms:
    """build_course_blueprint con atoms assegna content_atom_ids ai moduli."""

    def test_atoms_assigned_to_module(self, course_folder_with_modules: CourseFolder) -> None:
        atoms = {
            "l1": (_make_atom(atom_id="l1/definition/0"),),
            "l2": (_make_atom(atom_id="l2/definition/0", lesson_id="l2"),),
        }
        bp = build_course_blueprint(course_folder_with_modules, atoms=atoms)
        assert bp.modules[0].content_atom_ids == ("l1/definition/0",)
        assert bp.modules[1].content_atom_ids == ("l2/definition/0",)

    def test_multiple_atoms_per_lesson(self, course_folder_with_modules: CourseFolder) -> None:
        atoms = {
            "l1": (
                _make_atom(atom_id="l1/definition/0"),
                _make_atom(atom_id="l1/example/0", atom_type="example",
                           lesson_id="l1", body="Example 1"),
                _make_atom(atom_id="l1/exercise/0", atom_type="exercise",
                           lesson_id="l1", body="Ex 1"),
            ),
        }
        bp = build_course_blueprint(course_folder_with_modules, atoms=atoms)
        assert len(bp.modules[0].content_atom_ids) == 3
        assert bp.modules[0].content_atom_ids == (
            "l1/definition/0", "l1/example/0", "l1/exercise/0",
        )

    def test_lesson_not_in_any_module(self, course_folder_with_modules: CourseFolder) -> None:
        """Atoms for lessons not in any module are silently dropped (no error)."""
        atoms = {
            "unknown_lesson": (_make_atom(atom_id="unknown/definition/0",
                                          lesson_id="unknown_lesson"),),
        }
        bp = build_course_blueprint(course_folder_with_modules, atoms=atoms)
        # Modules unchanged, no content_atom_ids
        for mod in bp.modules:
            assert mod.content_atom_ids == ()

    def test_empty_atoms_dict(self, course_folder_with_modules: CourseFolder) -> None:
        bp = build_course_blueprint(course_folder_with_modules, atoms={})
        for mod in bp.modules:
            assert mod.content_atom_ids == ()

    def test_atoms_across_all_modules(self, course_folder_with_modules: CourseFolder) -> None:
        atoms = {
            "l1": (_make_atom(atom_id="l1/def/0"), _make_atom(atom_id="l1/ex/0",
                      atom_type="example", lesson_id="l1", body="Ex")),
            "l2": (_make_atom(atom_id="l2/def/0", lesson_id="l2"),),
        }
        bp = build_course_blueprint(course_folder_with_modules, atoms=atoms)
        total_ids = sum(len(m.content_atom_ids) for m in bp.modules)
        assert total_ids == 3


# ── Audience & Level ──────────────────────────────────────────────────────


class TestAudienceAndLevel:
    """Pass-through di audience/level."""

    def test_default_empty(self, course_folder_with_modules: CourseFolder) -> None:
        bp = build_course_blueprint(course_folder_with_modules)
        assert bp.audience == ""
        assert bp.level == ""

    def test_audience_and_level(self, course_folder_with_modules: CourseFolder) -> None:
        bp = build_course_blueprint(
            course_folder_with_modules,
            audience="studenti universitari",
            level="intermedio",
        )
        assert bp.audience == "studenti universitari"
        assert bp.level == "intermedio"

    def test_only_audience(self, course_folder_with_modules: CourseFolder) -> None:
        bp = build_course_blueprint(
            course_folder_with_modules,
            audience="studenti",
        )
        assert bp.audience == "studenti"
        assert bp.level == ""


# ── Integration: course + atoms from capsule_to_atoms ─────────────────────


class TestIntegration:
    """Integration test: build from real CourseFolder + real capsule_to_atoms."""

    def test_from_sample_course(self) -> None:
        """Carica sample_course, produce atoms, costruisce blueprint."""
        course = load_course_folder("fixtures/sample_course")
        assert course.title == "Calcolo 2 — Integrali e ODE"
        assert len(course.modules) == 3

        # Simula capsule_to_atoms per ogni lezione (crea atomi finti)
        atoms: dict[str, tuple[ContentAtom, ...]] = {}
        for lesson in course.lessons:
            atoms[lesson.lesson_id] = (
                _make_atom(
                    atom_id=f"{lesson.lesson_id}/definition/0",
                    atom_type="definition",
                    lesson_id=lesson.lesson_id,
                    body=f"Main concept of {lesson.lesson_id}",
                ),
            )

        bp = build_course_blueprint(course, atoms=atoms)
        assert len(bp.modules) == 3
        # Ogni modulo ha esattamente 1 atomo dalla sua lezione
        for mod in bp.modules:
            assert len(mod.content_atom_ids) == len(mod.lesson_ids)
            for lid in mod.lesson_ids:
                assert any(lid in aid for aid in mod.content_atom_ids)

        assert bp.source_lessons == (
            "l1_derivatives", "l2_integrals", "l3_differential_equations",
        )
