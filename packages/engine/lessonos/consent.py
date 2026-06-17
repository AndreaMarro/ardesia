"""GDPR consent-state for a teacher↔class relationship (VINCOLO FERREO §5.1).

Before the agent processes a class's lessons it must know whether the data
subject's consent is **currently** in force. That answer is not a flag someone
flips: it is a *state machine over time* — consent is granted (optionally with
an expiry), can be revoked, and lapses on its own when an expiry passes. To be
auditable under GDPR every transition must leave a trace.

This module models consent as an **append-only event log** (:class:`ConsentEvent`,
persisted by the store) from which the current :class:`ConsentStatus` is *derived*
on demand:

- :func:`grant_consent` / :func:`revoke_consent` append one immutable event.
- :func:`consent_status` folds the trail + an injected ``now`` into one of
  four states: ``active`` (a live grant), ``expired`` (a grant past its
  ``expires_at``), ``revoked`` (an explicit revocation), ``absent`` (no events).
- :func:`consent_audit_trail` returns the full ordered history for an auditor.

Nothing is ever mutated in place, so the trail is tamper-evident, and expiry is
*computed* (a grant carries its ``expires_at``; no background job writes an
"expired" row) which keeps the whole thing deterministic and ZERO-LLM. ``now``
is an explicit parameter, never a hidden clock, so expiry is reproducible in a
test. Every identifier is an opaque pseudonym — consistent with the rest of the
CRM layer, PII stays in the external vault, never in these nodes.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

from lessonos.models.crm import ConsentEvent
from lessonos.store.base import Store

# The four derived states. Only ``granted``/``revoked`` are *recorded* actions
# (lessonos.models.crm.CONSENT_ACTIONS); ``expired``/``absent`` are computed.
ACTIVE = "active"
EXPIRED = "expired"
REVOKED = "revoked"
ABSENT = "absent"


@dataclass(frozen=True)
class ConsentStatus:
    """The consent state of a teacher↔class relation at a given instant.

    - ``state``: one of ``active`` / ``expired`` / ``revoked`` / ``absent``.
    - ``since``: ISO-8601 UTC timestamp of the event that produced the current
      state (the grant for active/expired, the revocation for revoked); ``None``
      when ``absent``.
    - ``expires_at``: the live/lapsed grant's expiry (ISO-8601 UTC), or ``None``
      when the grant is perpetual / state is revoked / absent.
    """

    state: str
    since: str | None = None
    expires_at: str | None = None


def _to_utc(moment: datetime) -> datetime:
    """Normalise to an aware UTC datetime (assume UTC for a naive input).

    Keeps comparisons total: a naive ``now`` and an aware ``expires_at`` (or
    vice-versa) would raise ``TypeError`` otherwise.
    """
    if moment.tzinfo is None:
        return moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc)


def _iso(moment: datetime) -> str:
    return _to_utc(moment).isoformat()


def grant_consent(
    store: Store,
    teacher_id: str,
    class_id: str,
    *,
    now: datetime,
    expires_at: datetime | None = None,
    event_id: str | None = None,
) -> ConsentEvent:
    """Record a consent grant for *teacher_id*↔*class_id* effective at *now*.

    A subsequent grant simply appends another event (a renewal that supersedes
    any prior grant or revocation — the trail keeps both). ``expires_at`` is
    optional: omit it for perpetual consent.

    Raises:
        ValueError: if *expires_at* is not strictly after *now* (a grant that
            is already expired carries no consent and is almost certainly a
            caller bug).
    """
    if expires_at is not None and _to_utc(expires_at) <= _to_utc(now):
        raise ValueError(
            f"expires_at ({_iso(expires_at)}) must be after now ({_iso(now)})"
        )
    event = ConsentEvent(
        event_id=event_id or f"ce_{uuid4().hex}",
        teacher_id=teacher_id,
        class_id=class_id,
        action="granted",
        at=_iso(now),
        expires_at=_iso(expires_at) if expires_at is not None else None,
    )
    store.save_consent_event(event)
    return event


def revoke_consent(
    store: Store,
    teacher_id: str,
    class_id: str,
    *,
    now: datetime,
    event_id: str | None = None,
) -> ConsentEvent:
    """Record a consent revocation for *teacher_id*↔*class_id* at *now*.

    Revocation is unconditional: it appends an event regardless of the prior
    state (revoking when already revoked/absent is allowed and simply leaves
    another trail entry — the data subject's "no" is always recordable).
    """
    event = ConsentEvent(
        event_id=event_id or f"ce_{uuid4().hex}",
        teacher_id=teacher_id,
        class_id=class_id,
        action="revoked",
        at=_iso(now),
    )
    store.save_consent_event(event)
    return event


def consent_audit_trail(
    store: Store, teacher_id: str, class_id: str
) -> tuple[ConsentEvent, ...]:
    """The full append-only consent history for the relation (oldest first)."""
    return store.consent_events_for_relation(teacher_id, class_id)


def consent_status(
    store: Store,
    teacher_id: str,
    class_id: str,
    *,
    now: datetime,
) -> ConsentStatus:
    """Derive the consent state of the relation at *now* from its event trail.

    The latest recorded event decides the state: a revocation ⇒ ``revoked``; a
    grant ⇒ ``active`` while live, or ``expired`` once ``now`` reaches its
    ``expires_at`` (expiry is **inclusive**: consent is live strictly *before*
    the expiry instant). No events ⇒ ``absent``.
    """
    events = consent_audit_trail(store, teacher_id, class_id)
    if not events:
        return ConsentStatus(state=ABSENT)

    last = events[-1]
    if last.action == "revoked":
        return ConsentStatus(state=REVOKED, since=last.at)

    if last.expires_at is not None and _to_utc(now) >= datetime.fromisoformat(
        last.expires_at
    ):
        return ConsentStatus(
            state=EXPIRED, since=last.at, expires_at=last.expires_at
        )
    return ConsentStatus(state=ACTIVE, since=last.at, expires_at=last.expires_at)


def is_consent_active(
    store: Store,
    teacher_id: str,
    class_id: str,
    *,
    now: datetime,
) -> bool:
    """True iff consent is currently in force (the agent gate's one question)."""
    return consent_status(store, teacher_id, class_id, now=now).state == ACTIVE
