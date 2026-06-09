"""Teacher-review stub — interface per revisione docente del corso compilato.

Definisce il contratto dati per la revisione umana di un corso prodotto
dal Course Foundry (PlannerResult -> Export). Il docente puo:

1. Rivedere il PlannerResult (blueprint + materiali)
2. Lasciare note strutturate per modulo/lezione/atomo
3. Approvare/Rivedere/Rifiutare il corso o parti di esso
4. Marcare singoli atomi come revisati (teacher_approved)

P1: stub deterministico. In futuro un LLM planner o UI web
popoleranno/consumeranno questi dati.

COORDINATION.md: CourseFolder -> Atoms -> Blueprint -> MarkdownPack ->
LiaScript -> Quarto -> MoodleXML -> Docling-adapter -> LLM-planner ->
Teacher-review (questo modulo).

Deterministico, zero-LLM, frozen/ValueError pattern.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Sequence


class ReviewAction(Enum):
    """Azione di revisione che un docente puo applicare a un corso/modulo/atomo.

    Ogni azione ha una semantica precisa per il flusso di pubblicazione:
    - APPROVE: il contenuto e pronto per pubblicazione
    - REVISE: il contenuto necessita modifiche prima della pubblicazione
    - REJECT: il contenuto non e accettabile nella forma attuale
    - FLAG: segnalazione non-bloccante (es. dubbio, nota per il team)
    """

    APPROVE = "approve"
    REVISE = "revise"
    REJECT = "reject"
    FLAG = "flag"


class ReviewScope(Enum):
    """Scope della revisione — a quale livello di granularita si applica."""

    COURSE = "course"
    MODULE = "module"
    LESSON = "lesson"
    ATOM = "atom"


@dataclass(frozen=True)
class TeacherReviewNote:
    """Nota di revisione del docente su un elemento del corso.

    Ogni nota e associata a univocamente a:
    - Un action (approve/revise/reject/flag)
    - Uno scope (course/module/lesson/atom)
    - Un target_id (id dell'elemento revisionato)

    Attributes:
        note_id: Identificatore unico della nota (es. 'rev-001').
        action: Azione di revisione (approve/revise/reject/flag).
        scope: Ambito della revisione (course/module/lesson/atom).
        target_id: ID dell'elemento revisionato
            (es. course.title, module.title, lesson.lesson_id, atom.atom_id).
        comment: Commento opzionale del docente.
        reviewer: Nome/identificativo del revisore (opzionale in v0.
            Puo essere vuoto per stub).
    """

    note_id: str
    action: ReviewAction
    scope: ReviewScope
    target_id: str
    comment: str = ""
    reviewer: str = ""

    def __post_init__(self) -> None:
        if not self.note_id:
            raise ValueError("note_id must be non-empty")
        if not self.target_id:
            raise ValueError("target_id must be non-empty")
        if not isinstance(self.action, ReviewAction):
            raise ValueError(
                f"action must be a ReviewAction enum, got {type(self.action).__name__}"
            )
        if not isinstance(self.scope, ReviewScope):
            raise ValueError(
                f"scope must be a ReviewScope enum, got {type(self.scope).__name__}"
            )


@dataclass(frozen=True)
class TeacherReviewSet:
    """Set completo di note di revisione per un corso.

    Raccoglie tutte le note di revisione del docente e fornisce
    metodi di utilita per interrogare lo stato di approvazione.

    Attributes:
        course_id: Identificatore del corso revisionato.
        notes: Tuple ordinata di TeacherReviewNote (append-only).
        notes: Tuple di note di revisione.
    """

    course_id: str
    notes: tuple[TeacherReviewNote, ...] = ()

    def __post_init__(self) -> None:
        if not self.course_id:
            raise ValueError("course_id must be non-empty")

    @property
    def has_approve(self) -> bool:
        """Almeno una nota APPROVE esiste? (non implica approvazione completa)."""
        return any(n.action == ReviewAction.APPROVE for n in self.notes)

    @property
    def has_blockers(self) -> bool:
        """Ci sono note che bloccano la pubblicazione?"""
        return any(
            n.action in (ReviewAction.REVISE, ReviewAction.REJECT)
            for n in self.notes
        )

    @property
    def has_flags(self) -> bool:
        """Ci sono flag (non-bloccanti)?"""
        return any(n.action == ReviewAction.FLAG for n in self.notes)

    def notes_for_scope(self, scope: ReviewScope) -> tuple[TeacherReviewNote, ...]:
        """Filtra note per scope."""
        return tuple(n for n in self.notes if n.scope == scope)

    def notes_for_target(self, target_id: str) -> tuple[TeacherReviewNote, ...]:
        """Filtra note per target_id."""
        return tuple(n for n in self.notes if n.target_id == target_id)

    def add_note(self, note: TeacherReviewNote) -> TeacherReviewSet:
        """Restituisce un nuovo TeacherReviewSet con la nota aggiunta (immutabile)."""
        if not isinstance(note, TeacherReviewNote):
            raise ValueError("note must be a TeacherReviewNote instance")
        # Verifica unicita note_id
        existing_ids = {n.note_id for n in self.notes}
        if note.note_id in existing_ids:
            raise ValueError(f"note_id '{note.note_id}' already exists in this set")
        return TeacherReviewSet(
            course_id=self.course_id,
            notes=self.notes + (note,),
        )

    def __len__(self) -> int:
        return len(self.notes)


# ---- Stub functions (deterministic, zero-LLM) ----


def make_review_note(
    note_id: str,
    *,
    action: str | ReviewAction,
    scope: str | ReviewScope,
    target_id: str,
    comment: str = "",
    reviewer: str = "",
) -> TeacherReviewNote:
    """Crea una nota di revisione con validazione.

    Accetta sia stringhe che enum per action/scope (comodo per test
    e per futura serializzazione da UI/API).

    Args:
        note_id: Identificatore unico.
        action: ReviewAction o stringa corrispondente.
        scope: ReviewScope o stringa corrispondente.
        target_id: ID dell'elemento revisionato.
        comment: Commento opzionale.
        reviewer: Nome revisore opzionale.

    Returns:
        TeacherReviewNote validata.

    Raises:
        ValueError: Se action/scope non sono validi o campi obbligatori vuoti.
    """
    # Risolvi action da stringa
    if isinstance(action, str):
        try:
            action_enum = ReviewAction(action)
        except ValueError:
            valid = [a.value for a in ReviewAction]
            raise ValueError(
                f"invalid action '{action}'. Must be one of: {valid}"
            )
    elif isinstance(action, ReviewAction):
        action_enum = action
    else:
        raise ValueError(
            f"action must be str or ReviewAction, got {type(action).__name__}"
        )

    # Risolvi scope da stringa
    if isinstance(scope, str):
        try:
            scope_enum = ReviewScope(scope)
        except ValueError:
            valid = [s.value for s in ReviewScope]
            raise ValueError(
                f"invalid scope '{scope}'. Must be one of: {valid}"
            )
    elif isinstance(scope, ReviewScope):
        scope_enum = scope
    else:
        raise ValueError(
            f"scope must be str or ReviewScope, got {type(scope).__name__}"
        )

    return TeacherReviewNote(
        note_id=note_id,
        action=action_enum,
        scope=scope_enum,
        target_id=target_id,
        comment=comment,
        reviewer=reviewer,
    )


def make_empty_review_set(course_id: str) -> TeacherReviewSet:
    """Crea un TeacherReviewSet vuoto per un corso."""
    return TeacherReviewSet(course_id=course_id)


def is_course_approved(review_set: TeacherReviewSet) -> bool:
    """Determina se un corso e approvato per pubblicazione.

    Un corso e approvato se:
    - Ha almeno una nota APPROVE a livello COURSE (approvazione esplicita)
    - Non ha blocker (REVISE/REJECT)

    Se non ci sono note, il corso NON e approvato (non rivisto).

    Args:
        review_set: Il set di note di revisione.

    Returns:
        True se approvato, False altrimenti.
    """
    if review_set.has_blockers:
        return False
    # Cerca approvazione esplicita a livello corso
    for note in review_set.notes:
        if (
            note.action == ReviewAction.APPROVE
            and note.scope == ReviewScope.COURSE
        ):
            return True
    return False
