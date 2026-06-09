"""Tests for lessonos/course/planner.py — LLM-planner stub.

Non-tautologici, frozen/ValueError pattern, zero-LLM, zero deps.
"""

from __future__ import annotations

import json
import os
import tempfile

from lessonos.course.atoms import ContentAtom
from lessonos.course.planner import (
    PlannerMaterial,
    PlannerResult,
    plan_course,
)
from lessonos.course.schema import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
)


# ── PlannerMaterial tests ──────────────────────────────────────────────────────


class TestPlannerMaterial:
    def test_minimal_valid(self) -> None:
        pm = PlannerMaterial(source_id="src1", content="some content")
        assert pm.source_id == "src1"
        assert pm.content == "some content"
        assert pm.lesson_id is None

    def test_full_fields(self) -> None:
        pm = PlannerMaterial(
            source_id="src1",
            content="calc notes",
            lesson_id="l1",
            filename="notes.md",
            source_type="markdown",
        )
        assert pm.lesson_id == "l1"
        assert pm.filename == "notes.md"
        assert pm.source_type == "markdown"

    def test_empty_source_id_raises(self) -> None:
        try:
            PlannerMaterial(source_id="", content="text")
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "source_id" in str(e)

    def test_empty_content_raises(self) -> None:
        try:
            PlannerMaterial(source_id="s1", content="")
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "content" in str(e)


# ── PlannerResult tests ────────────────────────────────────────────────────────


class TestPlannerResult:
    def _sample_blueprint(self) -> CourseBlueprint:
        return CourseBlueprint(
            title="Test Course",
            modules=(
                ModuleBlueprint(
                    title="Module 1", lesson_ids=("l1", "l2"), objectives=()
                ),
            ),
            source_lessons=("l1", "l2"),
        )

    def test_minimal_valid(self) -> None:
        bp = self._sample_blueprint()
        pr = PlannerResult(blueprint=bp)
        assert pr.blueprint.title == "Test Course"
        assert pr.materials == {}
        assert pr.source_lessons == ()
        assert pr.warnings == ()

    def test_with_materials(self) -> None:
        bp = self._sample_blueprint()
        mats = {
            "s1": PlannerMaterial(source_id="s1", content="hello"),
        }
        pr = PlannerResult(
            blueprint=bp,
            materials=mats,
            source_lessons=("l1", "l2"),
            warnings=("missing source 's2'",),
        )
        assert pr.materials["s1"].content == "hello"
        assert pr.source_lessons == ("l1", "l2")
        assert pr.warnings == ("missing source 's2'",)

    def test_not_blueprint_raises(self) -> None:
        try:
            PlannerResult(blueprint="not a blueprint")  # type: ignore
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "blueprint" in str(e)

    def test_source_lesson_not_in_blueprint_raises(self) -> None:
        bp = self._sample_blueprint()
        try:
            PlannerResult(
                blueprint=bp,
                source_lessons=("l1", "nonexistent"),
            )
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "not found" in str(e)

    def test_frozen(self) -> None:
        bp = self._sample_blueprint()
        pr = PlannerResult(blueprint=bp)
        # The blueprint reference should be frozen
        try:
            pr.blueprint = bp  # type: ignore
            assert False, "Expected FrozenInstanceError"
        except Exception as e:
            # FrozenInstanceError message: "cannot assign to field 'blueprint'"
            assert "cannot assign" in str(e).lower()


# ── plan_course integration tests ──────────────────────────────────────────────


class TestPlanCourse:
    """Integration tests with a real temp course folder (no LLM, zero deps)."""

    def _create_sample_course(
        self, tmp_path: str, extra_lesson: str | None = None
    ) -> str:
        """Create a minimal course folder with course.json, lessons, and sources."""
        lessons = [
            ("l1_derivatives", 1, ["src1"]),
            ("l2_integrals", 2, ["src2"]),
        ]
        if extra_lesson:
            lessons.append((extra_lesson, 3, ["src3"]))

        sources = [
            {"source_id": "src1", "filename": "calc_basics.md", "source_type": "markdown"},
            {"source_id": "src2", "filename": "integral_theory.md", "source_type": "markdown"},
        ]
        if extra_lesson:
            sources.append(
                {"source_id": "src3", "filename": "extra.md", "source_type": "markdown"}
            )

        course = {
            "title": "Test Calculus",
            "lessons": [
                {
                    "lesson_id": lid,
                    "title": f"Lesson {lid}",
                    "order": order,
                    "source_ids": srcs,
                }
                for lid, order, srcs in lessons
            ],
            "sources": sources,
            "modules": [
                {
                    "title": "Derivatives",
                    "lesson_ids": ["l1_derivatives"],
                    "objectives": ["Understand derivatives"],
                },
                {
                    "title": "Integrals",
                    "lesson_ids": ["l2_integrals"],
                    "objectives": ["Understand integrals"],
                },
            ],
        }

        folder = os.path.join(tmp_path, "test_course")
        os.makedirs(folder)
        os.makedirs(os.path.join(folder, "sources"))
        for s in sources:
            src_path = os.path.join(folder, "sources", s["filename"])
            with open(src_path, "w") as f:
                f.write(f"# {s['filename']}\n\nContent for {s['source_id']}.\n")

        for lid, _, _ in lessons:
            os.makedirs(os.path.join(folder, "lessons", lid))

        with open(os.path.join(folder, "course.json"), "w") as f:
            json.dump(course, f)

        return folder

    def test_plan_valid_course(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder)
            assert isinstance(result, PlannerResult)
            assert result.blueprint.title == "Test Calculus"
            assert len(result.blueprint.modules) == 2
            assert len(result.source_lessons) == 2

    def test_plan_with_source_materials(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, include_source_materials=True)
            assert len(result.materials) == 2
            assert "src1" in result.materials
            assert "src2" in result.materials
            assert result.materials["src1"].content.strip()
            assert result.materials["src2"].content.strip()

    def test_plan_without_materials(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, include_source_materials=False)
            assert result.materials == {}
            assert result.warnings == ()

    def test_plan_with_audience_level(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, audience="uni", level="intermediate")
            assert result.blueprint.audience == "uni"
            assert result.blueprint.level == "intermediate"

    def test_plan_missing_folder_raises(self) -> None:
        try:
            plan_course("/nonexistent/folder")
            assert False, "Expected ValueError"
        except ValueError:
            pass

    def test_plan_missing_course_json_raises(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            empty_folder = os.path.join(tmp, "no_course")
            os.makedirs(empty_folder)
            try:
                plan_course(empty_folder)
                assert False, "Expected ValueError"
            except ValueError:
                pass

    def test_source_lessons_ordered(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp, extra_lesson="l3_ode")
            result = plan_course(folder)
            assert result.source_lessons == (
                "l1_derivatives",
                "l2_integrals",
                "l3_ode",
            )

    def test_warnings_on_missing_source_file(self) -> None:
        """When a source file is deleted from disk, load_course_folder raises
        ValueError (the source file must exist). The test verifies this
        fails fast rather than loading with missing files silently."""
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            # Delete a source file to trigger ValueError in loader
            os.remove(os.path.join(folder, "sources", "integral_theory.md"))
            try:
                plan_course(folder)
                assert False, "Expected ValueError for missing source file"
            except ValueError as e:
                assert "source file not found" in str(e)

    def test_plan_deterministic(self) -> None:
        """Same input -> same blueprint (materials may differ on disk)."""
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result1 = plan_course(folder, include_source_materials=False)
            result2 = plan_course(folder, include_source_materials=False)
            assert result1.blueprint == result2.blueprint
            assert result1.source_lessons == result2.source_lessons

    def test_empty_modules(self) -> None:
        """A course with no modules in course.json uses fallback single module."""
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            # Rewrite course.json with no modules section
            course_path = os.path.join(folder, "course.json")
            with open(course_path) as f:
                course = json.load(f)
            del course["modules"]
            with open(course_path, "w") as f:
                json.dump(course, f)
            result = plan_course(folder, include_source_materials=False)
            assert len(result.blueprint.modules) == 1
            assert len(result.blueprint.modules[0].lesson_ids) == 2

    def test_source_material_filename_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, include_source_materials=True)
            src1 = result.materials["src1"]
            assert src1.filename == "calc_basics.md"
            assert src1.source_type == "markdown"

    def test_no_warnings_for_valid_course(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, include_source_materials=True)
            assert len(result.warnings) == 0

    def test_plan_with_atoms_per_lesson(self) -> None:
        """atoms_per_lesson forwarded to build_course_blueprint → content_atom_ids."""

        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            atoms = {
                "l1_derivatives": (
                    ContentAtom(
                        atom_id="l1_derivatives/definition/0",
                        atom_type="definition",
                        lesson_id="l1_derivatives",
                        body="Derivative is the slope",
                        source_refs=(),
                        explicit_ai_inference=True,
                    ),
                    ContentAtom(
                        atom_id="l1_derivatives/example/0",
                        atom_type="example",
                        lesson_id="l1_derivatives",
                        body="f(x)=x^2 → f'(x)=2x",
                        source_refs=(),
                        explicit_ai_inference=True,
                    ),
                ),
                "l2_integrals": (
                    ContentAtom(
                        atom_id="l2_integrals/definition/0",
                        atom_type="definition",
                        lesson_id="l2_integrals",
                        body="Integral is the area",
                        source_refs=(),
                        explicit_ai_inference=True,
                    ),
                ),
            }
            result = plan_course(folder, atoms_per_lesson=atoms)
            assert result.blueprint.modules[0].content_atom_ids == (
                "l1_derivatives/definition/0",
                "l1_derivatives/example/0",
            )
            assert result.blueprint.modules[1].content_atom_ids == (
                "l2_integrals/definition/0",
            )

    def test_plan_with_atoms_per_lesson_empty(self) -> None:
        """Empty atoms_per_lesson dict produces empty content_atom_ids."""
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder, atoms_per_lesson={})
            for mod in result.blueprint.modules:
                assert mod.content_atom_ids == ()

    def test_plan_with_atoms_per_lesson_none(self) -> None:
        """None atoms_per_lesson (default) produces empty content_atom_ids (backward compat)."""
        with tempfile.TemporaryDirectory() as tmp:
            folder = self._create_sample_course(tmp)
            result = plan_course(folder)
            for mod in result.blueprint.modules:
                assert mod.content_atom_ids == ()
