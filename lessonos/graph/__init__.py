"""Lesson Graph construction, query, Didactic Delta, and Learning Debt (PLAN §3.2 + M3 + M4)."""

from lessonos.graph.builder import build_lesson_graph, build_path_graph
from lessonos.graph.didactic_delta import (
    DeltaConceptChange,
    DidacticDelta,
    compute_didactic_delta,
)
from lessonos.graph.learning_debt import (
    DEBT_KINDS,
    LearningDebtLedger,
    compute_learning_debt,
)
from lessonos.graph.next_lesson_planner import (
    LessonAgendaItem,
    NextLessonPlan,
    compute_next_lesson_plan,
)
from lessonos.graph.path_memory import (
    ConceptPathEntry,
    LessonIndexEntry,
    PathMemory,
    apply_review_feedback,
    build_path_memory,
    compute_difficulty_update,
    compute_retention,
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
    "DEBT_KINDS",
    "DeltaConceptChange",
    "DidacticDelta",
    "LearningDebtLedger",
    "LessonAgendaItem",
    "LessonIndexEntry",
    "NextLessonPlan",
    "PathMemory",
    "all_prerequisites_deep",
    "apply_review_feedback",
    "build_lesson_graph",
    "build_networkx_graph",
    "build_path_graph",
    "build_path_memory",
    "compute_didactic_delta",
    "compute_difficulty_update",
    "compute_learning_debt",
    "compute_next_lesson_plan",
    "compute_retention",
    "find_concept",
    "lesson_of_concept",
    "prerequisites_of",
    "topological_concepts",
    "where_introduced",
    "where_reinforced",
]
