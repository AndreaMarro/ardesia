"""Lesson Graph construction, query, and Didactic Delta (PLAN §3.2 + M3 + M4)."""

from lessonos.graph.builder import build_lesson_graph, build_path_graph
from lessonos.graph.didactic_delta import (
    DeltaConceptChange,
    DidacticDelta,
    compute_didactic_delta,
)
from lessonos.graph.path_memory import (
    ConceptPathEntry,
    LessonIndexEntry,
    PathMemory,
    build_path_memory,
)
from lessonos.graph.queries import (
    all_prerequisites_deep,
    build_networkx_graph,
    find_concept,
    lesson_of_concept,
    prerequisites_of,
    topological_concepts,
    where_introduced,
    where_reinforced,
)

__all__ = [
    "ConceptPathEntry",
    "DeltaConceptChange",
    "DidacticDelta",
    "LessonIndexEntry",
    "PathMemory",
    "all_prerequisites_deep",
    "build_lesson_graph",
    "build_networkx_graph",
    "build_path_graph",
    "build_path_memory",
    "compute_didactic_delta",
    "find_concept",
    "lesson_of_concept",
    "prerequisites_of",
    "topological_concepts",
    "where_introduced",
    "where_reinforced",
]
