"""Course Foundry — compila cartella lezioni reali -> corso strutturato.

P0a: CourseFolder schema + folder_loader (deterministic, zero-LLM).
"""

from lessonos.course.folder_loader import build_course_blueprint, load_course_folder
from lessonos.course.schema import (
    CourseBlueprint,
    CourseFolder,
    CourseLessonRef,
    CourseSourceRef,
    ModuleBlueprint,
)

__all__ = [
    "CourseFolder",
    "CourseLessonRef",
    "CourseSourceRef",
    "CourseBlueprint",
    "ModuleBlueprint",
    "load_course_folder",
    "build_course_blueprint",
]
