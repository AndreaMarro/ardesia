"""Course Foundry — compila cartella lezioni reali -> corso strutturato.

P0a: CourseFolder schema + folder_loader (deterministic, zero-LLM).
P0b: ContentAtom dataclass + capsule_to_atoms converter.
P0c: CourseBlueprint builder con content_atom_ids (deterministic, zero-LLM).
"""

from lessonos.course.atoms import ATOM_TYPES, ContentAtom, capsule_to_atoms
from lessonos.course.blueprint import build_course_blueprint
from lessonos.course.folder_loader import load_course_folder
from lessonos.course.schema import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
)

__all__ = [
    "ATOM_TYPES",
    "ContentAtom",
    "capsule_to_atoms",
    "build_course_blueprint",
    "CourseBlueprint",
    "CourseFolder",
    "CourseLessonRef",
    "CourseSourceRef",
    "ModuleBlueprint",
    "load_course_folder",
]
