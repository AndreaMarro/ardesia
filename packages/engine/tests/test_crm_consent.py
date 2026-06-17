"""Consent-state primitive (VINCOLO FERREO §5.1): grant/revoke/expiry/audit.

The consent module models GDPR consent for a teacher↔class relation as an
append-only event log from which the current state is *derived*. These tests
pin three things that matter for an audit:

- the four derived states (active/expired/revoked/absent) are computed
  deterministically from the trail + an injected ``now`` (no hidden clock);
- expiry is INCLUSIVE and reproducible (the boundary instant is expired);
- the trail is append-only and structurally PII-free (no personal column).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from lessonos.consent import (
    ABSENT,
    ACTIVE,
    EXPIRED,
    REVOKED,
    ConsentStatus,
    consent_audit_trail,
    consent_status,
    grant_consent,
    is_consent_active,
    revoke_consent,
)
from lessonos.models.crm import CONSENT_ACTIONS, ConsentEvent
from lessonos.store.sqlite import SQLiteStore

T0 = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
TEACHER = "tch_alpha"
CLASS = "cls_beta"


@pytest.fixture()
def store():
    s = SQLiteStore()
    try:
        yield s
    finally:
        s.close()


# --- Domain validation (the dataclass guards) ---------------------------------


class TestConsentEventDomain:
    def test_actions_are_granted_and_revoked_only(self):
        assert CONSENT_ACTIONS == frozenset({"granted", "revoked"})

    @pytest.mark.parametrize("field", ["event_id", "teacher_id", "class_id"])
    def test_identifier_fields_reject_pii_shapes(self, field):
        kwargs = {
            "event_id": "ce_1",
            "teacher_id": TEACHER,
            "class_id": CLASS,
            "action": "granted",
            "at": T0.isoformat(),
        }
        kwargs[field] = "Mario Rossi"  # whitespace = a name
        with pytest.raises(ValueError):
            ConsentEvent(**kwargs)
        kwargs[field] = "mario@example.com"  # '@' = an email
        with pytest.raises(ValueError):
            ConsentEvent(**kwargs)

    def test_unknown_action_rejected(self):
        with pytest.raises(ValueError):
            ConsentEvent(
                event_id="ce_1",
                teacher_id=TEACHER,
                class_id=CLASS,
                action="expired",  # derived, never recorded
                at=T0.isoformat(),
            )

    def test_revocation_cannot_carry_expiry(self):
        with pytest.raises(ValueError):
            ConsentEvent(
                event_id="ce_1",
                teacher_id=TEACHER,
                class_id=CLASS,
                action="revoked",
                at=T0.isoformat(),
                expires_at=T0.isoformat(),
            )

    def test_empty_at_rejected(self):
        with pytest.raises(ValueError):
            ConsentEvent(
                event_id="ce_1",
                teacher_id=TEACHER,
                class_id=CLASS,
                action="granted",
                at="",
            )


# --- grant / revoke → derived state -------------------------------------------


class TestGrantRevokeStatus:
    def test_absent_when_no_events(self, store):
        status = consent_status(store, TEACHER, CLASS, now=T0)
        assert status == ConsentStatus(state=ABSENT)
        assert is_consent_active(store, TEACHER, CLASS, now=T0) is False

    def test_grant_makes_active(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        status = consent_status(store, TEACHER, CLASS, now=T0)
        assert status.state == ACTIVE
        assert status.since == T0.isoformat()
        assert status.expires_at is None
        assert is_consent_active(store, TEACHER, CLASS, now=T0) is True

    def test_revoke_makes_revoked(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        revoke_at = T0 + timedelta(hours=1)
        revoke_consent(store, TEACHER, CLASS, now=revoke_at)
        status = consent_status(store, TEACHER, CLASS, now=revoke_at)
        assert status.state == REVOKED
        assert status.since == revoke_at.isoformat()
        assert status.expires_at is None
        assert is_consent_active(store, TEACHER, CLASS, now=revoke_at) is False

    def test_revoke_overrides_a_live_grant(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        revoke_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        # Even queried far before the revoke's clock, the LATEST recorded event
        # wins (insertion order, not timestamp): consent is revoked.
        assert (
            consent_status(store, TEACHER, CLASS, now=T0).state == REVOKED
        )

    def test_regrant_after_revoke_is_active_again(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        revoke_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        regrant_at = T0 + timedelta(hours=2)
        grant_consent(store, TEACHER, CLASS, now=regrant_at)
        status = consent_status(store, TEACHER, CLASS, now=regrant_at)
        assert status.state == ACTIVE
        assert status.since == regrant_at.isoformat()

    def test_revoke_when_absent_is_allowed(self, store):
        # The data subject's "no" is always recordable, even with no prior grant.
        revoke_consent(store, TEACHER, CLASS, now=T0)
        assert consent_status(store, TEACHER, CLASS, now=T0).state == REVOKED


# --- expiry (computed, inclusive, deterministic) ------------------------------


class TestExpiry:
    def test_active_strictly_before_expiry(self, store):
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        status = consent_status(
            store, TEACHER, CLASS, now=expires - timedelta(seconds=1)
        )
        assert status.state == ACTIVE
        assert status.expires_at == expires.isoformat()

    def test_boundary_instant_is_expired(self, store):
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        status = consent_status(store, TEACHER, CLASS, now=expires)
        assert status.state == EXPIRED
        assert status.since == T0.isoformat()
        assert status.expires_at == expires.isoformat()

    def test_after_expiry_is_expired(self, store):
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        status = consent_status(
            store, TEACHER, CLASS, now=expires + timedelta(days=1)
        )
        assert status.state == EXPIRED
        assert is_consent_active(
            store, TEACHER, CLASS, now=expires + timedelta(days=1)
        ) is False

    def test_regrant_revives_an_expired_grant(self, store):
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        # past expiry → expired
        now = expires + timedelta(days=1)
        assert consent_status(store, TEACHER, CLASS, now=now).state == EXPIRED
        grant_consent(
            store, TEACHER, CLASS, now=now, expires_at=now + timedelta(days=30)
        )
        assert consent_status(store, TEACHER, CLASS, now=now).state == ACTIVE

    def test_grant_with_past_expiry_rejected(self, store):
        with pytest.raises(ValueError):
            grant_consent(
                store, TEACHER, CLASS, now=T0, expires_at=T0 - timedelta(days=1)
            )

    def test_grant_with_expiry_equal_to_now_rejected(self, store):
        with pytest.raises(ValueError):
            grant_consent(store, TEACHER, CLASS, now=T0, expires_at=T0)

    def test_naive_and_aware_datetimes_compare(self, store):
        # A naive ``now`` must not raise against an aware ``expires_at`` (the
        # service normalises both to UTC). Grant aware, query naive.
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        naive_after = datetime(2026, 3, 1, 12, 0, 0)  # > expires, no tzinfo
        assert (
            consent_status(store, TEACHER, CLASS, now=naive_after).state
            == EXPIRED
        )


# --- audit trail (append-only, ordered, isolated) -----------------------------


class TestAuditTrail:
    def test_records_every_action_in_order(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        revoke_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        grant_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=2))
        trail = consent_audit_trail(store, TEACHER, CLASS)
        assert [e.action for e in trail] == ["granted", "revoked", "granted"]

    def test_trail_is_append_only(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        first = consent_audit_trail(store, TEACHER, CLASS)
        revoke_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        second = consent_audit_trail(store, TEACHER, CLASS)
        # The original grant is untouched; the revoke is appended after it.
        assert second[0] == first[0]
        assert len(second) == len(first) + 1

    def test_trail_records_timestamps_and_expiry(self, store):
        expires = T0 + timedelta(days=30)
        grant_consent(store, TEACHER, CLASS, now=T0, expires_at=expires)
        (event,) = consent_audit_trail(store, TEACHER, CLASS)
        assert event.at == T0.isoformat()
        assert event.expires_at == expires.isoformat()

    def test_trail_isolated_per_relation(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        grant_consent(store, "tch_other", CLASS, now=T0)
        grant_consent(store, TEACHER, "cls_other", now=T0)
        assert len(consent_audit_trail(store, TEACHER, CLASS)) == 1
        assert len(consent_audit_trail(store, "tch_other", CLASS)) == 1
        assert len(consent_audit_trail(store, TEACHER, "cls_other")) == 1

    def test_reusing_event_id_is_rejected_append_only(self, store):
        # The trail is immutable: a second write of the same event_id must
        # raise (integrity violation), never overwrite/reorder history. This is
        # what makes "latest recorded event wins" trustworthy.
        grant_consent(store, TEACHER, CLASS, now=T0, event_id="ce_fixed")
        with pytest.raises(Exception):
            revoke_consent(
                store, TEACHER, CLASS, now=T0 + timedelta(hours=1),
                event_id="ce_fixed",
            )

    def test_latest_recorded_wins_under_clock_skew(self, store):
        # The most-recently RECORDED event decides the state, even when its
        # ``at`` timestamp is EARLIER than a previously recorded event (caller
        # clock skew). Insertion order — not ``at`` — is causal order.
        grant_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=5))
        revoke_consent(store, TEACHER, CLASS, now=T0)  # earlier ``at``
        status = consent_status(store, TEACHER, CLASS, now=T0 + timedelta(hours=9))
        assert status.state == REVOKED  # last recorded wins, not latest ``at``


# --- structural zero-PII (no personal column to leak) -------------------------


class TestStructuralZeroPII:
    def test_consent_table_has_only_pseudonymous_columns(self, store):
        rows = store._conn.execute(
            "PRAGMA table_info(consent_events)"
        ).fetchall()
        columns = {r["name"] for r in rows}
        assert columns == {
            "event_id",
            "teacher_id",
            "class_id",
            "action",
            "at",
            "expires_at",
        }


# --- persistence (round-trip across reconnect) --------------------------------


class TestPersistence:
    def test_consent_survives_reconnect(self, tmp_path):
        db = str(tmp_path / "consent.db")
        s1 = SQLiteStore(db)
        grant_consent(s1, TEACHER, CLASS, now=T0)
        revoke_consent(s1, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        s1.close()

        s2 = SQLiteStore(db)
        try:
            trail = consent_audit_trail(s2, TEACHER, CLASS)
            assert [e.action for e in trail] == ["granted", "revoked"]
            assert consent_status(
                s2, TEACHER, CLASS, now=T0 + timedelta(hours=1)
            ).state == REVOKED
        finally:
            s2.close()


# --- transaction support ------------------------------------------------------


class TestTransaction:
    def test_commit_persists_events(self, store):
        store.begin_transaction()
        grant_consent(store, TEACHER, CLASS, now=T0)
        store.commit_transaction()
        assert len(consent_audit_trail(store, TEACHER, CLASS)) == 1

    def test_rollback_discards_events(self, store):
        grant_consent(store, TEACHER, CLASS, now=T0)
        store.begin_transaction()
        revoke_consent(store, TEACHER, CLASS, now=T0 + timedelta(hours=1))
        store.rollback_transaction()
        trail = consent_audit_trail(store, TEACHER, CLASS)
        assert [e.action for e in trail] == ["granted"]
