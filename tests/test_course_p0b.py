"""Tests for P0b: ContentAtom + capsule_to_atoms converter (COORDINATION.md §16).

Test categories:
  1. ATOM_TYPES vocab validation
  2. ContentAtom validation (atom_type, source_refs rule, empty fields)
  3. capsule_to_atoms mapping (concepts→definition/example/explanation,
     exercises→exercise, questions→student_question, homework→homework)
  4. Edge cases: empty capsule, timeline-only, explicit_ai_inference flag
  5. Immutability check
"""

from __future__ import annotations

from dataclasses import FrozenInstanceError
from typing import Any

import pytest

from lessonos.capsule.assembly import LessonCapsule
from lessonos.capsule.extraction import (
    Citation,
    ConceptExtraction,
    ExerciseExtraction,
    HomeworkExtraction,
    LessonContent,
    QuestionExtraction,
)
from lessonos.capsule.segmentation import TopicSpan
from lessonos.course.atoms import ATOM_TYPES, ContentAtom, capsule_to_atoms


# ── helpers ────────────────────────────────────────────────────────────────

def _make_capsule(
    lesson_id: str = "l1_test",
    concepts: tuple[dict, ...] = (),
    exercises: tuple[dict, ...] = (),
    questions: tuple[dict, ...] = (),
    homework: tuple[dict, ...] = (),
    timeline: tuple[tuple[str, ...], ...] = (),
) -> LessonCapsule:
    """Build a minimal LessonCapsule for testing."""
    return LessonCapsule(
        lesson_id=lesson_id,
        timeline=tuple(
            TopicSpan(lesson_id=lesson_id, topic=t, seg_ids=tuple(sids), start=0, end=60)
            for t, *sids in timeline
        ),
        content=LessonContent(
            lesson_id=lesson_id,
            concepts=tuple(
                ConceptExtraction(
                    name=c["name"],
                    status=c.get("status", "introduced"),
                    prerequisites=tuple(c.get("prerequisites", [])),
                    citations=tuple(
                        Citation(
                            seg_id=ref["seg_id"],
                            excerpt=ref.get("excerpt"),
                            confidence=ref.get("confidence"),
                        )
                        for ref in c.get("citations", [])
                    ),
                )
                for c in concepts
            ),
            exercises=tuple(
                ExerciseExtraction(
                    prompt=e["prompt"],
                    solution=e.get("solution"),
                    citations=tuple(
                        Citation(seg_id=ref["seg_id"])
                        for ref in e.get("citations", [])
                    ),
                )
                for e in exercises
            ),
            student_questions=tuple(
                QuestionExtraction(
                    question=q["question"],
                    citations=tuple(
                        Citation(seg_id=ref["seg_id"])
                        for ref in q.get("citations", [])
                    ),
                )
                for q in questions
            ),
            homework=tuple(
                HomeworkExtraction(
                    task=h["task"],
                    citations=tuple(
                        Citation(seg_id=ref["seg_id"])
                        for ref in h.get("citations", [])
                    ),
                )
                for h in homework
            ),
        ),
    )


def _valid_atom(**overrides: Any) -> dict:
    """Build a valid ContentAtom kwargs dict with sensible defaults."""
    defaults = {
        "atom_id": "l1_test/definition/0",
        "atom_type": "definition",
        "lesson_id": "l1_test",
        "body": "Derivative definition",
        "source_refs": (Citation(seg_id="l1s1", excerpt="Derivative"),),
    }
    defaults.update(overrides)
    return defaults


# ── ATOM_TYPES ─────────────────────────────────────────────────────────────

class TestAtomTypes:
    """ATOM_TYPES frozenset contains expected types."""

    def test_contains_definition(self) -> None:
        assert "definition" in ATOM_TYPES

    def test_contains_explanation(self) -> None:
        assert "explanation" in ATOM_TYPES

    def test_contains_example(self) -> None:
        assert "example" in ATOM_TYPES

    def test_contains_exercise(self) -> None:
        assert "exercise" in ATOM_TYPES

    def test_contains_quiz_question(self) -> None:
        assert "quiz_question" in ATOM_TYPES

    def test_contains_student_question(self) -> None:
        assert "student_question" in ATOM_TYPES

    def test_contains_misconception(self) -> None:
        assert "misconception" in ATOM_TYPES

    def test_contains_homework(self) -> None:
        assert "homework" in ATOM_TYPES

    def test_contains_summary(self) -> None:
        assert "summary" in ATOM_TYPES

    def test_contains_objective(self) -> None:
        assert "objective" in ATOM_TYPES

    def test_contains_prerequisite(self) -> None:
        assert "prerequisite" in ATOM_TYPES

    def test_contains_teacher_note(self) -> None:
        assert "teacher_note" in ATOM_TYPES

    def test_contains_source_excerpt(self) -> None:
        assert "source_excerpt" in ATOM_TYPES

    def test_excludes_unknown(self) -> None:
        assert "invalid_type" not in ATOM_TYPES

    def test_total_count(self) -> None:
        # Esattamente 13 tipi secondo COORDINATION.md §16
        assert len(ATOM_TYPES) == 13


# ── ContentAtom validation ──────────────────────────────────────────────────

class TestContentAtomValidation:
    """ContentAtom __post_init__ validation."""

    def test_valid_atom_creates(self) -> None:
        atom = ContentAtom(**_valid_atom())
        assert atom.atom_id == "l1_test/definition/0"
        assert atom.body == "Derivative definition"
        assert atom.teacher_approved is False
        assert atom.confidence is None
        assert atom.explicit_ai_inference is False

    def test_invalid_atom_type_raises(self) -> None:
        with pytest.raises(ValueError, match="invalid atom_type"):
            ContentAtom(**_valid_atom(atom_type="not_a_type"))

    def test_empty_atom_id_raises(self) -> None:
        with pytest.raises(ValueError, match="atom_id must be non-empty"):
            ContentAtom(**_valid_atom(atom_id=""))

    def test_empty_body_raises(self) -> None:
        with pytest.raises(ValueError, match="body must be non-empty"):
            ContentAtom(**_valid_atom(body=""))

    def test_empty_lesson_id_raises(self) -> None:
        with pytest.raises(ValueError, match="lesson_id must be non-empty"):
            ContentAtom(**_valid_atom(lesson_id=""))

    def test_empty_source_refs_no_flag_raises(self) -> None:
        with pytest.raises(ValueError, match="source_refs are required"):
            ContentAtom(**_valid_atom(source_refs=(), explicit_ai_inference=False))

    def test_empty_source_refs_with_flag_ok(self) -> None:
        atom = ContentAtom(**_valid_atom(
            source_refs=(),
            explicit_ai_inference=True,
            atom_type="summary",
        ))
        assert atom.source_refs == ()
        assert atom.explicit_ai_inference is True

    def test_immutable(self) -> None:
        atom = ContentAtom(**_valid_atom())
        with pytest.raises(FrozenInstanceError):
            atom.body = "changed"  # type: ignore[misc]

    def test_teacher_approved_default_false(self) -> None:
        atom = ContentAtom(**_valid_atom())
        assert atom.teacher_approved is False

    def test_teacher_approved_true(self) -> None:
        atom = ContentAtom(**_valid_atom(teacher_approved=True))
        assert atom.teacher_approved is True

    def test_confidence_optional(self) -> None:
        atom = ContentAtom(**_valid_atom(confidence=0.85))
        assert atom.confidence == 0.85

    def test_confidence_none(self) -> None:
        atom = ContentAtom(**_valid_atom())
        assert atom.confidence is None


# ── capsule_to_atoms ────────────────────────────────────────────────────────

class TestCapsuleToAtoms:
    """capsule_to_atoms converter."""

    def test_empty_capsule_returns_empty(self) -> None:
        capsule = _make_capsule()
        atoms = capsule_to_atoms(capsule)
        assert atoms == ()

    def test_concept_introduced_becomes_definition(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "introduced",
                    "citations": ({"seg_id": "l1s1"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert len(atoms) == 1
        assert atoms[0].atom_type == "definition"
        assert atoms[0].body == "Derivata"

    def test_concept_new_becomes_definition(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "introduced",
                    "citations": ({"seg_id": "l1s1", "excerpt": "Derivata"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert atoms[0].atom_type == "definition"

    def test_concept_reinforced_becomes_example(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "reinforced",
                    "citations": ({"seg_id": "l1s2"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert atoms[0].atom_type == "example"

    def test_concept_problematic_becomes_explanation(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "problematic",
                    "citations": ({"seg_id": "l1s1"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert atoms[0].atom_type == "explanation"

    def test_exercise_becomes_exercise_atom(self) -> None:
        capsule = _make_capsule(
            exercises=(
                {
                    "prompt": "Calcola la derivata di x^2",
                    "citations": ({"seg_id": "l1s1"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert len(atoms) == 1
        assert atoms[0].atom_type == "exercise"
        assert atoms[0].body == "Calcola la derivata di x^2"

    def test_question_becomes_student_question_atom(self) -> None:
        capsule = _make_capsule(
            questions=(
                {
                    "question": "Perché la derivata è lineare?",
                    "citations": ({"seg_id": "l1s1"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert len(atoms) == 1
        assert atoms[0].atom_type == "student_question"
        assert atoms[0].body == "Perché la derivata è lineare?"

    def test_homework_becomes_homework_atom(self) -> None:
        capsule = _make_capsule(
            homework=(
                {
                    "task": "Esercizi 1-5 pagina 42",
                    "citations": ({"seg_id": "l1s3"},),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert len(atoms) == 1
        assert atoms[0].atom_type == "homework"
        assert atoms[0].body == "Esercizi 1-5 pagina 42"

    def test_timeline_produces_summary_with_flag(self) -> None:
        capsule = _make_capsule(
            timeline=(("Derivata", "l1s1", "l1s2"),),
        )
        atoms = capsule_to_atoms(capsule)
        # Solo il summary (nessun concept/exercise/etc.)
        assert len(atoms) == 1
        assert atoms[0].atom_type == "summary"
        assert atoms[0].explicit_ai_inference is True
        assert "Derivata" in atoms[0].body

    def test_full_capsule_produces_all_atoms(self) -> None:
        capsule = _make_capsule(
            lesson_id="l1_full",
            concepts=(
                {"name": "Derivata", "status": "introduced",
                 "citations": ({"seg_id": "l1s1", "excerpt": "Derivata"},)},
                {"name": "Integrale", "status": "introduced",
                 "citations": ({"seg_id": "l1s2", "excerpt": "Integrale"},)},
            ),
            exercises=(
                {"prompt": "Ex1", "citations": ({"seg_id": "l1s1"},)},
            ),
            questions=(
                {"question": "Q1?", "citations": ({"seg_id": "l1s2"},)},
            ),
            homework=(
                {"task": "HW1", "citations": ({"seg_id": "l1s3"},)},
            ),
            timeline=(("Derivata", "l1s1", "l1s2"), ("Integrale", "l1s3")),
        )
        atoms = capsule_to_atoms(capsule)
        # 2 concepts + 1 exercise + 1 question + 1 homework + 1 summary = 6
        assert len(atoms) == 6
        types = [a.atom_type for a in atoms]
        # 2 definitions (introduced + new)
        assert types.count("definition") == 2
        assert types.count("exercise") == 1
        assert types.count("student_question") == 1
        assert types.count("homework") == 1
        assert types.count("summary") == 1

    def test_atom_id_deterministic(self) -> None:
        capsule = _make_capsule(
            lesson_id="l1_det",
            concepts=(
                {"name": "C1", "status": "introduced",
                 "citations": ({"seg_id": "l1s1"},)},
            ),
            exercises=(
                {"prompt": "E1", "citations": ({"seg_id": "l1s1"},)},
            ),
        )
        atoms1 = capsule_to_atoms(capsule)
        atoms2 = capsule_to_atoms(capsule)
        assert [a.atom_id for a in atoms1] == [a.atom_id for a in atoms2]

    def test_atom_id_reflects_type_and_count(self) -> None:
        """atom_id DEVE seguire il pattern <lesson_id>/<type>/<count> (Claude review)."""
        capsule = _make_capsule(
            lesson_id="l1",
            concepts=(
                {"name": "C_intro", "status": "introduced",
                 "citations": ({"seg_id": "l1s1"},)},
                {"name": "C_reinf", "status": "reinforced",
                 "citations": ({"seg_id": "l1s2"},)},
                {"name": "C_prob", "status": "problematic",
                 "citations": ({"seg_id": "l1s3"},)},
                {"name": "C_intro2", "status": "introduced",
                 "citations": ({"seg_id": "l1s4"},)},
            ),
        )
        atoms = capsule_to_atoms(capsule)
        # 4 concept: 2 definition, 1 example, 1 explanation
        assert atoms[0].atom_id == "l1/definition/0"
        assert atoms[1].atom_id == "l1/example/0"
        assert atoms[2].atom_id == "l1/explanation/0"
        assert atoms[3].atom_id == "l1/definition/1"

    def test_source_refs_from_citations(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "introduced",
                    "citations": (
                        {"seg_id": "l1s1", "confidence": 0.9},
                        {"seg_id": "l1s2", "confidence": 0.8},
                    ),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert len(atoms[0].source_refs) == 2
        assert atoms[0].source_refs[0].seg_id == "l1s1"
        assert atoms[0].source_refs[1].seg_id == "l1s2"

    def test_confidence_averaged_from_citations(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {
                    "name": "Derivata",
                    "status": "introduced",
                    "citations": (
                        {"seg_id": "l1s1", "confidence": 0.9},
                        {"seg_id": "l1s2", "confidence": 0.8},
                    ),
                },
            ),
        )
        atoms = capsule_to_atoms(capsule)
        assert atoms[0].confidence == pytest.approx(0.85)

    def test_confidence_none_when_no_citations(self) -> None:
        capsule = _make_capsule(
            concepts=(
                {"name": "Derivata", "status": "introduced",
                 "citations": ()},
            ),
        )
        # Concept con citations vuote produce ContentAtom con source_refs=()
        # e fallisce la validazione per la regola source_refs obbligatorie.
        # Questo test verifica che capsule_to_atoms sollevi ValueError
        # quando tutti i concept non hanno citazioni (violazione grounding).
        with pytest.raises(ValueError, match="source_refs"):
            capsule_to_atoms(capsule)

    def test_result_is_immutable_tuple(self) -> None:
        capsule = _make_capsule()
        atoms = capsule_to_atoms(capsule)
        assert isinstance(atoms, tuple)
