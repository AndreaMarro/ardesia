"""LLM-planner stub — plan_course() bridge between raw materials and CourseBlueprint.

P1: defines the interface that an LLM planner will eventually implement.
For v0 (deterministic/mock), plan_course() wraps build_course_blueprint() and
optionally attaches source materials context.

COORDINATION.md §18 roadmap: CourseFolder → Atoms → Blueprint → Exporters →
Docling-adapter → LLM-planner → Teacher-review.

Deterministic, zero-LLM, frozen/ValueError pattern.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Sequence

from lessonos.course.blueprint import build_course_blueprint
from lessonos.course.folder_loader import load_course_folder
from lessonos.course.schema import CourseBlueprint, CourseFolder
from lessonos.export.source_extractor import (
    SourceMaterialPack,
    extract_source_materials,
)


@dataclass(frozen=True)
class PlannerMaterial:
    """A single source material with metadata for the planner.

    Lightweight wrapper that carries what the LLM planner would need:
    the content text and provenance info.

    Attributes:
        source_id: Stable identifier from the CourseFolder.
        content: Extracted text content.
        lesson_id: Which lesson this material belongs to (None if global).
        filename: Original filename for display.
        source_type: The type (markdown, text, pdf, etc.).
    """

    source_id: str
    content: str
    lesson_id: str | None = None
    filename: str = ""
    source_type: str = "text"

    def __post_init__(self) -> None:
        if not self.source_id:
            raise ValueError("source_id must not be empty")
        if not self.content:
            raise ValueError("content must not be empty")


@dataclass(frozen=True)
class PlannerResult:
    """Risultato del planner: blueprint + materiali sorgente.

    This is the bridge between raw CourseFolder materials and the
    export pipeline. The blueprint tells the exporter WHAT to render;
    the materials provide the CONTENT to render from.

    Attributes:
        blueprint: The CourseBlueprint (module structure + atom layout).
        materials: Source materials grouped by source_id.
        source_lessons: Ordered list of lesson_ids in the course.
        warnings: Any non-fatal issues during planning (e.g. missing sources).
    """

    blueprint: CourseBlueprint
    materials: Dict[str, PlannerMaterial] = field(default_factory=dict)
    source_lessons: tuple[str, ...] = ()
    warnings: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not isinstance(self.blueprint, CourseBlueprint):
            raise ValueError("blueprint must be a CourseBlueprint instance")
        # Validate that source_lessons are a subset of blueprint's lessons
        if self.source_lessons:
            blueprint_lessons = set(self.blueprint.source_lessons)
            for lid in self.source_lessons:
                if lid not in blueprint_lessons:
                    raise ValueError(
                        f"source_lesson '{lid}' not found in blueprint lessons"
                    )


def _load_planner_materials(
    course: CourseFolder,
    source_pack: SourceMaterialPack | None = None,
) -> tuple[Dict[str, PlannerMaterial], tuple[str, ...]]:
    """Load source materials from the course folder into PlannerMaterial dict.

    Args:
        course: The CourseFolder to load materials from.
        source_pack: Optional pre-loaded SourceMaterialPack. If None,
            loads automatically from disk.

    Returns:
        Tuple of (materials dict, warnings tuple).

    ZERO-LLM, deterministic, frozen/ValueError pattern.
    """
    if source_pack is None:
        source_pack = extract_source_materials(course)

    materials: Dict[str, PlannerMaterial] = {}
    warnings: list[str] = []

    for source_id, material in source_pack.materials.items():
        if not material.content:
            if material.error:
                warnings.append(
                    f"Source '{source_id}' ({material.filename}): "
                    f"{material.error}"
                )
            continue
        materials[source_id] = PlannerMaterial(
            source_id=material.source_id,
            content=material.content,
            lesson_id=material.lesson_id,
            filename=material.filename,
            source_type=material.source_type,
        )

    # Report errors as warnings
    for source_id, error in source_pack.errors.items():
        warnings.append(f"Source '{source_id}': {error}")

    return materials, tuple(warnings)


def plan_course(
    folder_path: str,
    *,
    audience: str = "",
    level: str = "",
    include_source_materials: bool = True,
) -> PlannerResult:
    """Course planner — produce a PlannerResult from a course folder path.

    For v0 (deterministic/mock): wraps build_course_blueprint() and loads
    source materials. This establishes the interface that an LLM-based
    planner will later implement with actual content analysis.

    Args:
        folder_path: Path to the course folder (must contain course.json).
        audience: Optional audience description (pass-through to blueprint).
        level: Optional level description (pass-through to blueprint).
        include_source_materials: If True, loads and attaches source materials.
            Default True. Only set False for tests that don't need materials.

    Returns:
        PlannerResult with blueprint + loaded materials.

    Raises:
        ValueError: If folder doesn't exist, course.json missing, or
            blueprint construction fails.

    ZERO-LLM, deterministic, frozen/ValueError pattern.
    """
    course = load_course_folder(folder_path)
    blueprint = build_course_blueprint(course, audience=audience, level=level)
    source_lessons = tuple(c.lesson_id for c in course.lessons)

    materials: Dict[str, PlannerMaterial] = {}
    warnings: tuple[str, ...] = ()

    if include_source_materials:
        materials, warnings = _load_planner_materials(course)

    return PlannerResult(
        blueprint=blueprint,
        materials=materials,
        source_lessons=source_lessons,
        warnings=warnings,
    )
