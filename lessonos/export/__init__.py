"""LessonOS Export — Course Compiler output formatters (P1).

P1: export deterministico (no-LLM) da CourseBlueprint + ContentAtoms
a formati pronti per pubblicazione/distribuzione.

Formati pianificati:
  - markdown: course.md + module files + exercises.md + quiz.md
  - liascript: corso interattivo .md + quiz per LiaScript
  - quarto: _quarto.yml + .qmd -> HTML/PDF/slides
  - moodle_xml: quiz XML per Moodle

Docling-adapter: PDF, DOCX, HTML, VTT, SRT extraction via subprocess + stdlib.

COORDINATION.md §18: P1 export — render DETERMINISTICO no-LLM.
"""

from lessonos.export.docling_adapter import docling_extract
from lessonos.export.liascript import LiaScriptCoursePack, export_liascript
from lessonos.export.markdown_course import MarkdownCoursePack, export_course_markdown
from lessonos.export.moodle_xml import MoodleXMLQuizPack, export_moodle_xml
from lessonos.export.obsidian_vault import export_vault
from lessonos.export.quarto import QuartoCoursePack, QuartoSlidesPack, export_quarto, export_quarto_slides

__all__ = [
    "LiaScriptCoursePack",
    "MoodleXMLQuizPack",
    "MarkdownCoursePack",
    "QuartoCoursePack",
    "QuartoSlidesPack",
    "docling_extract",
    "export_course_markdown",
    "export_liascript",
    "export_moodle_xml",
    "export_quarto",
    "export_quarto_slides",
    "export_vault",
]
