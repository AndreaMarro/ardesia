"""Anonymised CRM relation: teacher / class / student (GDPR by construction).

The agent core orchestrates lessons over a *roster* — which teacher owns which
class, which students sit in it — without ever touching a person's identity.
Every **identifier** here is an opaque pseudonym: there is no ``name``,
``email`` or ``dob`` field, so a person can never be *identified* from these
nodes (VINCOLO FERREO §5.1). The mapping pseudonym → real identity is the
school's external "PII vault", deliberately outside the agent nodes. In
particular ``Student`` carries a single field — there is nowhere to put a name.

Scope of the guarantee (no overclaim): it covers the *identifier* fields. The
one non-id field, ``SchoolClass.subject``, is a non-personal discipline label
(e.g. ``"fisica"``) by the same convention as the pre-existing ``Path.subject``
— free text, not an identity, and therefore not pseudonym-guarded (a multi-word
discipline like ``"fisica applicata"`` is legitimate). Callers must keep
personal data out of it, exactly as for ``Path.subject`` / ``Source.title``.

``assert_pseudonymous`` is a structural safety-net for the id fields, not a
complete PII detector: it rejects the obvious PII shapes (whitespace = a full
name like ``"Mario Rossi"``; ``@`` = an email). The real guarantee is the
*absence of PII-bearing identifier fields* on the dataclasses themselves.

Pure domain, no I/O — persistence (SQLite CRUD) lives in ``store``.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from lessonos.models.entities import require_non_empty, validate_enum

# A name has whitespace ("Mario Rossi"); an email has '@'. Both are direct PII
# shapes an opaque pseudonym (e.g. "stu_a1b2c3") never carries.
_PII_SHAPE = re.compile(r"\s|@")


def assert_pseudonymous(value: str, name: str) -> None:
    """Raise ValueError unless *value* looks like an opaque pseudonym.

    Non-empty, and free of whitespace/``@`` — the shapes that betray a name or
    email leaking into an agent-facing identifier. A structural guard, NOT a
    full PII scanner: keep real identities in the external vault, never here.
    """
    require_non_empty(value, name)
    if _PII_SHAPE.search(value):
        raise ValueError(
            f"{name} must be an opaque pseudonym, not direct PII: {value!r} "
            "(whitespace/'@' suggests a name or email — keep identities in the "
            "external PII vault, never in agent nodes)"
        )


@dataclass(frozen=True)
class Teacher:
    """A teacher, identified only by an opaque pseudonym (no PII field)."""

    teacher_id: str

    def __post_init__(self) -> None:
        assert_pseudonymous(self.teacher_id, "teacher_id")


@dataclass(frozen=True)
class SchoolClass:
    """A class owned by one teacher. ``subject`` is a non-personal discipline
    label (e.g. ``"fisica"``), parallel to ``Path.subject``; it is never an
    identifier, so it is not guarded as a pseudonym."""

    class_id: str
    teacher_id: str
    subject: str | None = None

    def __post_init__(self) -> None:
        assert_pseudonymous(self.class_id, "class_id")
        assert_pseudonymous(self.teacher_id, "teacher_id")


@dataclass(frozen=True)
class Student:
    """A student, identified ONLY by an opaque pseudonym.

    The most PII-sensitive entity in the system: it has a single field by
    design, so there is nowhere to put a name. The ``students`` table mirrors
    this — one PK column, no personal column to leak.
    """

    student_id: str

    def __post_init__(self) -> None:
        assert_pseudonymous(self.student_id, "student_id")


@dataclass(frozen=True)
class Enrollment:
    """The membership link putting a (pseudonymous) student in a class."""

    enrollment_id: str
    class_id: str
    student_id: str

    def __post_init__(self) -> None:
        assert_pseudonymous(self.enrollment_id, "enrollment_id")
        assert_pseudonymous(self.class_id, "class_id")
        assert_pseudonymous(self.student_id, "student_id")


# The two actions a data subject's consent can take. Expiry is NOT an action:
# nobody *records* an expiry, it is derived from a grant's ``expires_at`` versus
# the current time (see :mod:`lessonos.consent`), so the audit trail only ever
# holds the actions a human actually performed.
CONSENT_ACTIONS: frozenset[str] = frozenset({"granted", "revoked"})


@dataclass(frozen=True)
class ConsentEvent:
    """One immutable entry in the append-only consent audit trail.

    GDPR consent for a teacher↔class relationship is *event-sourced*: every
    grant or revocation appends one of these, and the relationship's current
    state is derived from the latest event plus the clock (never mutated in
    place), so the trail is a complete, tamper-evident history for an audit.

    Like the rest of the CRM layer this is **structurally PII-free**: the only
    identifiers are opaque pseudonyms (``teacher_id``/``class_id`` + this
    event's own ``event_id``), guarded against the obvious name/email shapes.
    ``at`` and ``expires_at`` are ISO-8601 UTC timestamps (the service writes
    them); ``expires_at`` is meaningful only for a ``"granted"`` event — a
    revocation carries no expiry.
    """

    event_id: str
    teacher_id: str
    class_id: str
    action: str
    at: str
    expires_at: str | None = None

    def __post_init__(self) -> None:
        assert_pseudonymous(self.event_id, "event_id")
        assert_pseudonymous(self.teacher_id, "teacher_id")
        assert_pseudonymous(self.class_id, "class_id")
        validate_enum(self.action, CONSENT_ACTIONS, "consent action")
        require_non_empty(self.at, "at")
        if self.action == "revoked" and self.expires_at is not None:
            raise ValueError(
                "expires_at is only valid for a 'granted' event, not a revocation"
            )
        if self.expires_at is not None:
            require_non_empty(self.expires_at, "expires_at")
