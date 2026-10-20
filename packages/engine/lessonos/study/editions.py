"""Shared edition policy. Canonical dates and offers live in the existing Core."""
import json

from .calendar_time import normalize_sessions, instant
from .models import StudyError
from .store import canonical, identifier
from .transactions import transact


def owned_edition(store, principal, edition_id, connection):
    """Verify ownership in SQL before decoding a calendar or pack descriptor."""
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden', 403)
    if not connection.execute('SELECT id FROM study_editions WHERE id=? AND teacher_id=?',
                              (edition_id, principal.id)).fetchone():
        raise StudyError('forbidden', 403)
    return store.get_edition(edition_id)


def lock_owned_edition(store, principal, edition_id, connection):
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden', 403)
    # Every tutor/calendar mutation takes these locks in this order. Seat
    # commands take only the edition lock, and cannot form a reverse cycle.
    store.lock_teacher(connection, principal.id)
    store.lock_edition(connection, edition_id)
    return owned_edition(store, principal, edition_id, connection)


def checked_sessions(store, connection, principal, edition, sessions):
    normalized = normalize_sessions(edition['id'], sessions, edition['timezone'])
    intervals = [(instant(item['startUtc']), instant(item['endUtc'])) for item in normalized]
    siblings = connection.execute(
        'SELECT id,sessions,timezone FROM study_editions WHERE teacher_id=? AND id!=?',
        (principal.id, edition['id']))
    for row in siblings:
        previous = json.loads(row['sessions'])
        if not previous:
            continue
        for old in normalize_sessions(row['id'], previous, row['timezone']):
            old_start, old_end = instant(old['startUtc']), instant(old['endUtc'])
            if any(start < old_end and end > old_start for start, end in intervals):
                raise StudyError('calendar_conflict', 409)
    return normalized


def require_unoccupied(store, connection, edition_id):
    if connection.execute('SELECT 1 FROM study_members WHERE edition_id=? LIMIT 1',
                          (edition_id,)).fetchone() or connection.execute(
        "SELECT 1 FROM study_holds WHERE edition_id=? AND state='hold' AND expires_at>? LIMIT 1",
        (edition_id, store.clock())).fetchone():
        raise StudyError('reconfirmation_required', 409)


def configure_sessions_in_transaction(store, connection, principal, edition_id, sessions):
    edition = lock_owned_edition(store, principal, edition_id, connection)
    normalize_sessions(edition_id, sessions, edition['timezone'])
    if edition['sessions'] == sessions:
        return edition
    checked_sessions(store, connection, principal, edition, sessions)
    require_unoccupied(store, connection, edition_id)
    if edition['state'] not in ('collecting', 'draft', 'offered'):
        raise StudyError('edition_not_editable', 409)
    next_state = 'draft' if edition['state'] == 'offered' else edition['state']
    connection.execute('UPDATE study_editions SET sessions=?,state=? WHERE id=?',
                       (canonical(sessions), next_state, edition_id))
    store._event(connection, principal, 'edition.calendar', None,
                 {'editionId': edition_id, 'sessions': sessions})
    return store.get_edition(edition_id)


def offer_edition(store, principal, edition_id, key, *, confirmed):
    """Explicit test-offer command; HTTP preview/CAS is added by management."""
    store._principal(principal)
    if principal.role != 'teacher':
        raise StudyError('forbidden', 403)
    if confirmed is not True:
        raise StudyError('explicit_confirmation_required')
    def apply(connection):
        edition = lock_owned_edition(store, principal, edition_id, connection)
        if edition['state'] not in ('collecting', 'draft', 'offered'):
            raise StudyError('edition_not_editable', 409)
        checked_sessions(store, connection, principal, edition, edition['sessions'])
        if edition['state'] != 'offered':
            # A pre-gate hold has no acceptance bound to this newly confirmed
            # offer. Preserve it for review; never silently revalidate it.
            connection.execute("UPDATE study_holds SET state='payment_requires_review' WHERE edition_id=? AND state='hold'", (edition_id,))
        connection.execute("UPDATE study_editions SET state='offered' WHERE id=?", (edition_id,))
        return {**store.get_edition(edition_id), 'receiptId': identifier(),
                'offerScope': 'TEST_EDITION', 'scientificApproval': 'NOT_ATTESTED'}
    return transact(store, principal, 'edition.offered', key,
                    {'editionId': edition_id, 'confirmed': True}, apply)
