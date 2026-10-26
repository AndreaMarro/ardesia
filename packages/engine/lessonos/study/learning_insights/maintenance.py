"""Explicit operator retention sweep, including after restore; never scheduled here."""
import json
from . import OBSERVATION, PREFERENCE


def prune_expired(store, *, apply=False):
    """Only counts escape this operator boundary. No student payloads in logs.

    Deployment owners must arrange invocation within their approved retention
    process. Read-time filtering alone cannot enforce a physical deletion SLA.
    """
    with store.transaction() as c:
        rows = c.execute('SELECT id,payload FROM study_events WHERE kind=?', (OBSERVATION,)).fetchall()
        expired = [row['id'] for row in rows if json.loads(row['payload'])['expiresAt'] <= store.clock()]
        if apply:
            for event_id in expired:
                c.execute('DELETE FROM study_events WHERE id=?', (event_id,))
        return {'expiredEvents': len(expired), 'applied': apply}


def invalidate_after_restore(store, *, apply=False):
    """Conservatively discard optional state from an old backup.

    Required before serving a restored DB with optional analytics enabled.
    Restored receipts remain in the Core; optional choices require a new action.
    operations.restore_data invokes this on its staging database before serving.
    """
    with store.transaction() as c:
        count = c.execute('SELECT COUNT(*) FROM study_events WHERE kind IN (?,?)',
                          (OBSERVATION, PREFERENCE)).fetchone()[0]
        if apply:
            c.execute('DELETE FROM study_events WHERE kind IN (?,?)', (OBSERVATION, PREFERENCE))
        return {'optionalRows': count, 'applied': apply}
