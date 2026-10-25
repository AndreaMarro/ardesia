"""Rebuildable receipt/source/diary views; optional observations never grade.

No new identity, DB, ledger or passive browser tracker. Only explicit, default-off
optional usage events use the existing Core event store and a distinct purpose.
"""
import json
import math
import re
from ..models import StudyError
from ..store import canonical, digest, identifier
from ..submissions import get_receipt

OBSERVATION = 'learning.insights.observation.v1'
PREFERENCE = 'learning.insights.preference.v1'
KINDS = frozenset(('activity.started', 'activity.ended', 'attempt.seen', 'hint.used',
                   'feedback.read', 'transfer.started', 'study.resumed', 'difficulty.reported'))
LIMITS = ('Un esito deterministico riguarda questa prova, non certifica apprendimento.',
          'Gli aiuti esterni non sono osservati; minuti e riproduzioni non misurano attenzione.',
          'Confronti osservazionali senza attribuzione causale. Calibrazione item non disponibile.')


def _notice(notice):
    if notice is None:
        return None
    if (not isinstance(notice, dict) or set(notice) != {'version', 'purpose', 'retentionDays'}
            or any(not isinstance(notice[k], str) or not 1 <= len(notice[k]) <= 1000
                   for k in ('version', 'purpose'))
            or type(notice['retentionDays']) is not int or not 1 <= notice['retentionDays'] <= 30):
        raise StudyError('invalid_analytics_notice')
    return notice


def _student(store, principal, edition_id):
    if not isinstance(edition_id, str) or not 1 <= len(edition_id) <= 128:
        raise StudyError('invalid_edition')
    store._edition_access(principal, edition_id)
    if principal.role != 'student':
        raise StudyError('forbidden', 403)


def _settings(store, principal, edition_id):
    row = store.connection.execute('''SELECT payload FROM study_events
        WHERE actor_id=? AND kind=? AND json_extract(payload,'$.editionId')=?
        ORDER BY seq DESC LIMIT 1''', (principal.id, PREFERENCE, edition_id)).fetchone()
    return json.loads(row['payload']) if row else {'enabled': False, 'noticeVersion': None, 'since': None, 'consentId': None}


def preferences(store, principal, edition_id, *, notice=None):
    store._edition_access(principal, edition_id)
    notice = _notice(notice)
    value = _settings(store, principal, edition_id)
    return {'enabled': bool(principal.role == 'student' and notice and value['enabled']
                            and value['noticeVersion'] == notice['version']
                            and value.get('noticeSha256') == digest(canonical(notice))),
            'notice': notice, 'noticeVersion': value['noticeVersion'],
            'consentId': value.get('consentId') if value['enabled'] else None,
            'scope': 'OPTIONAL_USAGE_ONLY', 'essentialStudyAvailable': True}


def set_preferences(store, principal, edition_id, enabled, notice_version, *, notice=None):
    _student(store, principal, edition_id)
    notice = _notice(notice)
    if type(enabled) is not bool:
        raise StudyError('invalid_analytics_preference')
    if enabled and (notice is None or notice_version != notice['version']):
        raise StudyError('analytics_notice_required', 409)
    with store.transaction() as c:
        store.lock_aggregate(c, 'learning.insights', canonical([principal.id, edition_id]))
        previous = _settings(store, principal, edition_id)
        same = enabled and previous['enabled'] and previous.get('noticeSha256') == digest(canonical(notice))
        since = previous['since'] if same else store.clock()
        consent_id = previous.get('consentId') if same else identifier() if enabled else None
        if not same:
            c.execute('''DELETE FROM study_events WHERE actor_id=? AND kind=?
                AND json_extract(payload,'$.editionId')=?''', (principal.id, OBSERVATION, edition_id))
        store._event(c, principal, PREFERENCE, None,
                     {'editionId': edition_id, 'enabled': enabled,
                      'noticeVersion': notice_version if enabled else None, 'since': since,
                      'noticeSha256': digest(canonical(notice)) if enabled else None, 'consentId': consent_id})
    return preferences(store, principal, edition_id, notice=notice)


def _source_state(store, principal, refs):
    state = 'CURRENT'
    for ref in refs:
        try:
            source = store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])
            # The caller is authorized to the submitted immutable revision, not
            # necessarily to a later private head. Inspect only its state.
            current = store.connection.execute('SELECT current_revision FROM study_resources WHERE id=? AND deleted=0', (source['id'],)).fetchone()
        except StudyError as error:
            if error.status in (403, 404):
                return None
            raise
        if current is None:
            return None
        if current['current_revision'] != ref['revisionId']:
            state = 'HISTORICAL'
    return state


def _receipt_source(store, principal, edition_id, receipt_id):
    receipt = get_receipt(store, principal, receipt_id)
    row = store.connection.execute('SELECT edition_id,student_id,source_refs FROM study_submissions WHERE receipt_id=?', (receipt_id,)).fetchone()
    if row['edition_id'] != edition_id or row['student_id'] != principal.id:
        raise StudyError('forbidden', 403)
    if _source_state(store, principal, json.loads(row['source_refs'])) is None:
        raise StudyError('insight_source_unavailable', 409)
    return receipt


def ingest(store, principal, edition_id, events, *, notice=None):
    _student(store, principal, edition_id)
    notice = _notice(notice)
    try:
        size = len(canonical(events).encode('utf-8'))
    except (TypeError, ValueError, RecursionError):
        raise StudyError('invalid_learning_event') from None
    if not isinstance(events, list) or not 1 <= len(events) <= 20 or size > 4096:
        raise StudyError('learning_events_too_large', 413)
    now = store.clock()
    accepted = duplicates = 0
    with store.transaction() as c:
        store.lock_aggregate(c, 'learning.insights', canonical([principal.id, edition_id]))
        if not preferences(store, principal, edition_id, notice=notice)['enabled']:
            raise StudyError('optional_analytics_disabled', 409)
        settings = _settings(store, principal, edition_id)
        for event in events:
            if (not isinstance(event, dict) or set(event) != {'schemaVersion', 'eventId', 'receiptId', 'kind', 'occurredAt', 'consentId'}
                    or type(event['schemaVersion']) is not int or event['schemaVersion'] != 1
                    or not isinstance(event['kind'], str) or event['kind'] not in KINDS
                    or any(not isinstance(event[key], str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', event[key])
                           for key in ('eventId', 'receiptId', 'consentId'))
                    or type(event['occurredAt']) not in (int, float) or not math.isfinite(event['occurredAt'])):
                raise StudyError('invalid_learning_event')
            if (event['consentId'] != settings.get('consentId') or
                    not max(settings['since'], now - notice['retentionDays']*86400) <= event['occurredAt'] <= now + 60):
                raise StudyError('event_outside_consent_window', 409)
            _receipt_source(store, principal, edition_id, event['receiptId'])
            previous = c.execute('''SELECT payload FROM study_events WHERE actor_id=? AND kind=?
                AND json_extract(payload,'$.editionId')=? AND json_extract(payload,'$.event.eventId')=?''',
                (principal.id, OBSERVATION, edition_id, event['eventId'])).fetchone()
            if previous:
                if json.loads(previous['payload'])['event'] != event:
                    raise StudyError('learning_event_conflict', 409)
                duplicates += 1
                continue
            store._event(c, principal, OBSERVATION, None, {'editionId': edition_id, 'event': event,
                'noticeVersion': notice['version'], 'expiresAt': event['occurredAt'] + notice['retentionDays']*86400,
                'provenance': 'CLIENT_PROPOSED_SERVER_VALIDATED'})
            accepted += 1
    return {'accepted': accepted, 'duplicates': duplicates}


def _optional(store, principal, edition_id, notice):
    if principal.role != 'student':
        return []
    result = []
    with store.transaction() as c:
        store.lock_aggregate(c, 'learning.insights', canonical([principal.id, edition_id]))
        active = preferences(store, principal, edition_id, notice=notice)['enabled']
        rows = c.execute('''SELECT id,payload FROM study_events WHERE actor_id=? AND kind=?
            AND json_extract(payload,'$.editionId')=?''', (principal.id, OBSERVATION, edition_id)).fetchall()
        for row in rows:
            payload = json.loads(row['payload'])
            valid = active and payload['expiresAt'] > store.clock()
            if valid:
                try:
                    _receipt_source(store, principal, edition_id, payload['event']['receiptId'])
                except StudyError as error:
                    if error.status not in (403, 404, 409):
                        raise
                    valid = False
            if not valid:
                c.execute('DELETE FROM study_events WHERE id=?', (row['id'],))
            else:
                result.append({**payload['event'], 'provenance': payload['provenance'],
                               'expiresAt': payload['expiresAt']})
    return sorted(result, key=lambda item: (item['occurredAt'], item['eventId']))


def dashboard(store, principal, edition_id, *, notice=None):
    store._edition_access(principal, edition_id)
    notice = _notice(notice)
    query = '''SELECT s.id,s.receipt_id,s.student_id,s.activity_id,s.parent_id,s.source_refs,r.body
        FROM study_submissions s JOIN study_receipts r ON r.id=s.receipt_id
        WHERE s.edition_id=?'''
    parameters = [edition_id]
    if principal.role == 'student':
        query += ' AND s.student_id=?'
        parameters.append(principal.id)
    attempts = []
    by_submission = {}
    for row in store.connection.execute(query + ' ORDER BY s.created_at,s.id', parameters):
        refs = json.loads(row['source_refs'])
        source_state = _source_state(store, principal, refs)
        if source_state is None:
            continue
        receipt = json.loads(row['body'])
        evidence = receipt.get('activityEvidence', {})
        checks = [v for k, v in evidence.get('check', {}).items() if k.endswith('Matches') and type(v) is bool]
        context = receipt.get('courseContext', {})
        attempts.append({'receiptId': row['receipt_id'], 'activityId': row['activity_id'],
            'studentId': row['student_id'], 'parentId': row['parent_id'], 'receivedAt': receipt['receivedAt'],
            'modelVersion': context.get('modelVersion'), 'packRef': {key: context.get(key) for key in ('packId','packVersion','packSha256')},
            'sourceRefs': [{'resourceId': r['resourceId'], 'revisionId': r['revisionId']} for r in refs],
            'sourceState': source_state, 'supportUsed': evidence.get('supportUsed', []),
            'assistance': evidence.get('assistance', 'NOT_RECORDED'),
            'outcome': ('MATCH' if all(checks) else 'MISMATCH') if checks else 'NOT_CHECKED',
            'provenance': 'CANONICAL_RECEIPT'})
        by_submission[row['id']] = (attempts[-1], context)
    comparisons = []
    for after, after_context in by_submission.values():
        previous = by_submission.get(after['parentId'])
        if previous is None:
            continue
        before, before_context = previous
        same = all(before_context.get(key) == after_context.get(key) for key in
                   ('packId', 'packVersion', 'packSha256', 'modelId', 'modelVersion', 'parameters'))
        comparisons.append({'beforeReceiptId': before['receiptId'], 'afterReceiptId': after['receiptId'],
            'beforeOutcome': before['outcome'], 'afterOutcome': after['outcome'],
            'beforeAssistance': before['assistance'], 'afterAssistance': after['assistance'],
            'scope': 'SAME_MODEL_PARAMETERS' if same else 'CHANGED_CONTEXT',
            'provenance': 'CANONICAL_PARENT_RECEIPTS', 'causalInference': False})
    optional = _optional(store, principal, edition_id, notice)
    suppressed = principal.role == 'teacher' and len({a['studentId'] for a in attempts}) < 5
    from ..diary import get_diary
    threads = get_diary(store, principal, edition_id)['threads']
    suggestions = []
    recoveries = []
    categories = {}
    for thread in threads:
        if (thread['editionId'] != edition_id or thread.get('sourceState') != 'CURRENT'
                or thread.get('contested') or thread['status'] not in ('OPEN', 'PRACTISING', 'RECURRED', 'VERIFIED_RESOLVED')):
            continue
        source = thread.get('source')
        if not source or _source_state(store, principal, [source]) != 'CURRENT':
            continue
        if thread['status'] == 'VERIFIED_RESOLVED':
            verified = thread.get('latestVerification')
            transfer = next((a for a in thread['attempts'] if verified and a['attemptId'] == verified['attemptId']), None)
            if transfer is None or thread.get('verificationState') != 'CURRENT':
                continue
            receipt = store.connection.execute('SELECT receipt_id FROM study_submissions WHERE id=?', (verified['submissionId'],)).fetchone()
            if receipt is None:
                continue
            recoveries.append({'threadId': thread['threadId'], 'category': thread['category'],
                'sourceRef': {k: source[k] for k in ('resourceId', 'revisionId')},
                'verificationReceiptId': receipt['receipt_id'],
                'verificationSourceRefs': [{k: r[k] for k in ('resourceId', 'revisionId')} for r in transfer['sourceRefs']],
                'provenance': 'CORE_REVIEWED_TRANSFER',
                'scope': 'Verifica del tutor su una prova diversa; non misura causale dell’apprendimento.'})
            continue
        categories[thread['category']] = categories.get(thread['category'], 0) + 1
        suggestions.append({'threadId': thread['threadId'], 'category': thread['category'],
            'status': thread['status'], 'sourceRef': {k: source[k] for k in ('resourceId','revisionId')},
            'provenance': 'CORE_REVIEWED_OBSERVATION', 'uncertainty': 'Osservazione circoscritta e contestabile; non diagnosi.'})
    return {'schemaVersion': 1, 'editionId': edition_id, 'role': principal.role,
        'attempts': attempts, 'suggestions': suggestions, 'recoveries': recoveries,
        'comparisons': comparisons, 'cohortSuppressed': suppressed,
        'summary': None if suppressed else {'attempts': len(attempts),
            'checked': sum(a['outcome'] != 'NOT_CHECKED' for a in attempts),
            'matched': sum(a['outcome'] == 'MATCH' for a in attempts),
            'assisted': sum(a['assistance'] == 'SUPPORT_REQUESTED' for a in attempts),
            'observedCategories': categories},
        'optionalEvents': optional, 'preferences': preferences(store, principal, edition_id, notice=notice),
        'limits': list(LIMITS)}


def export(store, principal, edition_id, *, notice=None):
    return dashboard(store, principal, edition_id, notice=notice)
