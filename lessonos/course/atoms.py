"""ContentAtom — atomo didattico atomico (P0b, COORDINATION.md §16).

Ogni ContentAtom rappresenta un'unità minima di contenuto didattico, con un
tipo controllato (ATOM_TYPES) e source_refs obbligatorie (salvo flag esplicito).
Una LessonCapsule produce atomi tramite capsule_to_atoms(), riusando le
estrazioni già esistenti (concetti → definition/explanation, esercizi → exercise,
domande → student_question, compiti → homework).

Regole:
  - atom_type ∈ ATOM_TYPES (altrimenti ValueError)
  - source_refs OBBLIGATORIE salvo explicit_ai_inference=True
  - atom_id deterministico: `<lesson_id>/<atom_type>/<n>`
"""

from __future__ import annotations

from dataclasses import dataclass

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import Citation
from lessonos.models import validate_enum

ATOM_TYPES: frozenset[str] = frozenset({
    "definition",
    "explanation",
    "example",
    "exercise",
    "quiz_question",
    "student_question",
    "misconception",
    "homework",
    "summary",
    "objective",
    "prerequisite",
    "teacher_note",
    "source_excerpt",
})
"""Vocabolario controllato dei tipi atomo (PLAN §26.1 esteso per Course Foundry)."""


@dataclass(frozen=True)
class ContentAtom:
    """Atomo di contenuto didattico minimo e tracciabile (P0b).

    Ogni atomo è una singola unità di contenuto con un tipo controllato,
    sorgenti obbligatorie (salvo esplicita deroga) e metadati di qualità.
    """

    atom_id: str
    """Identificatore univoco dell'atomo (es. ``l1_derivatives/definition/0``)."""

    atom_type: str
    """Tipo atomo (∈ ATOM_TYPES)."""

    lesson_id: str
    """Lezione di origine."""

    body: str
    """Corpo del contenuto (testo, esercizio, domanda, ecc.)."""

    source_refs: tuple[Citation, ...] = ()
    """Citazioni alle fonti (seg_id del transcript). OBBLIGATORIE salvo flag."""

    teacher_approved: bool = False
    """Se l'insegnante ha approvato questo atomo (default False)."""

    confidence: float | None = None
    """Confidenza del modello (0.0–1.0, opzionale)."""

    explicit_ai_inference: bool = False
    """Se True, l'atomo è un'inferenza del modello NON direttamente citabile
    (es. una riassunto o un obiettivo didattico). source_refs può essere
    vuoto solo se questo flag è True."""

    def __post_init__(self) -> None:
        if not self.atom_id:
            raise ValueError("atom_id must be non-empty")
        validate_enum(self.atom_type, ATOM_TYPES, "atom_type")
        if not self.lesson_id:
            raise ValueError("lesson_id must be non-empty")
        if not self.body:
            raise ValueError("body must be non-empty")
        # source_refs obbligatorie salvo explicit_ai_inference
        if not self.source_refs and not self.explicit_ai_inference:
            raise ValueError(
                f"source_refs are required for atom {self.atom_id!r} "
                f"(set explicit_ai_inference=True to allow AI-inferred content)"
            )


def capsule_to_atoms(capsule: LessonCapsule) -> tuple[ContentAtom, ...]:
    """Convert a Lesson Capsule into a flat tuple of ContentAtoms (P0b).

    Mapping:
      - Ogni ConceptExtraction → 1 atom ``definition`` (status=introduced/new)
        oppure ``example`` (status=reinforced) oppure ``explanation``
        (status=problematic).
      - Ogni ExerciseExtraction → 1 atom ``exercise``
      - Ogni QuestionExtraction → 1 atom ``student_question``
      - Ogni HomeworkExtraction → 1 atom ``homework``
      - Le osservazioni didattiche generiche (da timeline) → ``summary``
        se la timeline ha topic spans.
    """
    atoms: list[ContentAtom] = []
    lesson_id = capsule.lesson_id

    # Contatori separati per tipo di concept
    counters: dict[str, int] = {"definition": 0, "example": 0, "explanation": 0}

    for concept in capsule.content.concepts:
        # Mappa status → atom_type
        if concept.status in ("introduced", "new"):
            c_type = "definition"
        elif concept.status == "reinforced":
            c_type = "example"
        else:
            c_type = "explanation"

        atom_id = f"{lesson_id}/{c_type}/{counters[c_type]}"
        counters[c_type] += 1

        atoms.append(ContentAtom(
            atom_id=atom_id,
            atom_type=c_type,
            lesson_id=lesson_id,
            body=concept.name,
            source_refs=concept.citations,
            confidence=_avg_confidence(concept.citations),
        ))

    for i, exercise in enumerate(capsule.content.exercises):
        atom_id = f"{lesson_id}/exercise/{i}"
        atoms.append(ContentAtom(
            atom_id=atom_id,
            atom_type="exercise",
            lesson_id=lesson_id,
            body=exercise.prompt,
            source_refs=exercise.citations,
        ))

    for i, question in enumerate(capsule.content.student_questions):
        atom_id = f"{lesson_id}/student_question/{i}"
        atoms.append(ContentAtom(
            atom_id=atom_id,
            atom_type="student_question",
            lesson_id=lesson_id,
            body=question.question,
            source_refs=question.citations,
        ))

    for i, hw in enumerate(capsule.content.homework):
        atom_id = f"{lesson_id}/homework/{i}"
        atoms.append(ContentAtom(
            atom_id=atom_id,
            atom_type="homework",
            lesson_id=lesson_id,
            body=hw.task,
            source_refs=hw.citations,
        ))

    # Genera un summary dalla timeline se ci sono topic spans
    if capsule.timeline:
        summary_body = "Lesson topics: " + "; ".join(
            t.topic for t in capsule.timeline
        )
        atom_id = f"{lesson_id}/summary/0"
        atoms.append(ContentAtom(
            atom_id=atom_id,
            atom_type="summary",
            lesson_id=lesson_id,
            body=summary_body,
            source_refs=(),
            explicit_ai_inference=True,
        ))

    return tuple(atoms)


def _avg_confidence(citations: tuple[Citation, ...]) -> float | None:
    """Calcola la confidenza media dalle citazioni (se presenti)."""
    confs = [c.confidence for c in citations if c.confidence is not None]
    if not confs:
        return None
    return sum(confs) / len(confs)
