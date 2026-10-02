"""Teacher-review contract for a revision of compiled course material.

Definisce il contratto dati per la revisione umana di un corso prodotto
dal Course Foundry (PlannerResult -> Export). Il docente puo:

1. Rivedere il PlannerResult (blueprint + materiali)
2. Lasciare note strutturate per modulo/lezione/atomo
3. Approvare/Rivedere/Rifiutare il corso o parti di esso
4. Marcare singoli atomi come revisati (teacher_approved)

Legacy notes without a material digest remain readable but cannot authorize
an export. Approval is evaluated against the exact current material bytes.

COORDINATION.md: CourseFolder -> Atoms -> Blueprint -> MarkdownPack ->
LiaScript -> Quarto -> MoodleXML -> Docling-adapter -> LLM-planner ->
Teacher-review (questo modulo).

Deterministico, zero-LLM, frozen/ValueError pattern.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
import hashlib
import re
from typing import Mapping, Sequence

from lessonos.models import require_non_empty


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
        revision_sha256: SHA-256 della revisione esatta del materiale. Le note
            legacy senza digest non approvano un export.
    """

    note_id: str
    action: ReviewAction
    scope: ReviewScope
    target_id: str
    comment: str = ""
    reviewer: str = ""
    revision_sha256: str = ""

    def __post_init__(self) -> None:
        require_non_empty(self.note_id, "note_id")
        require_non_empty(self.target_id, "target_id")
        if not isinstance(self.action, ReviewAction):
            raise ValueError(
                f"action must be a ReviewAction enum, got {type(self.action).__name__}"
            )
        if not isinstance(self.scope, ReviewScope):
            raise ValueError(
                f"scope must be a ReviewScope enum, got {type(self.scope).__name__}"
            )
        if self.revision_sha256 and (
            not isinstance(self.revision_sha256, str)
            or re.fullmatch(r"[a-f0-9]{64}", self.revision_sha256) is None
        ):
            raise ValueError("revision_sha256 must be a lowercase SHA-256 hex digest")


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
        require_non_empty(self.course_id, "course_id")

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
    revision_sha256: str = "",
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
        revision_sha256=revision_sha256,
    )


def make_empty_review_set(course_id: str) -> TeacherReviewSet:
    """Crea un TeacherReviewSet vuoto per un corso."""
    return TeacherReviewSet(course_id=course_id)


def material_revision_sha256(files: Mapping[str, bytes]) -> str:
    """Hash exact material bytes and their names in a stable, unambiguous order."""
    if not files:
        raise ValueError("material revision requires at least one file")
    digest = hashlib.sha256()
    for name in sorted(files):
        content = files[name]
        if not isinstance(name, str) or not name or not isinstance(content, bytes):
            raise ValueError("material revision requires named byte files")
        name_bytes = name.encode("utf-8")
        digest.update(len(name_bytes).to_bytes(8, "big"))
        digest.update(name_bytes)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return digest.hexdigest()


def is_course_approved(review_set: TeacherReviewSet, revision_sha256: str | None = None) -> bool:
    """Determine whether a named teacher approved this exact material revision.

    Un corso e approvato se:
    - Ha una nota APPROVE a livello COURSE per il course_id e la revisione;
    - La nota APPROVE registra un revisore non vuoto;
    - Non ha blocker REVISE/REJECT sulla stessa revisione.

    Senza digest corrente valido, la risposta e sempre False.

    Args:
        review_set: Il set di note di revisione.

    Returns:
        True se approvato, False altrimenti.
    """
    if not isinstance(revision_sha256, str) or re.fullmatch(r"[a-f0-9]{64}", revision_sha256) is None:
        return False
    current = tuple(n for n in review_set.notes if n.revision_sha256 == revision_sha256)
    if any(n.action in (ReviewAction.REVISE, ReviewAction.REJECT) for n in current):
        return False
    # Cerca approvazione esplicita a livello corso
    for note in current:
        if (
            note.action == ReviewAction.APPROVE
            and note.scope == ReviewScope.COURSE
            and note.target_id == review_set.course_id
            and note.reviewer.strip()
        ):
            return True
    return False
