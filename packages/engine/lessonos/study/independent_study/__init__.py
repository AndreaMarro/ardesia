"""Explainable independent study over canonical resources, receipts and models.

Resources hold navigation state. Only domain-issued revisions are accepted:
editing a generic resource cannot erase observed assistance or forge feedback.
No grade, mastery inference, provider call, new table or concurrent learner ledger.
"""
import json
import math
from copy import deepcopy
from .content import lessons, resolve
from ..activities import evaluate_activity
from ..catalog import edition_pack
from ..models import StudyError
from ..store import canonical, digest, identifier
from ..transactions import transact, lookup_receipt
from ..submissions import submit, get_receipt

KIND = 'independent-study-plan-v1'
PHASES = ('diagnostic', 'explanation', 'simulation', 'practice', 'recovery', 'transfer', 'review')


def _text(value, maximum=4000):
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise StudyError('invalid_study_text')
    return value.strip()


def _write(store, c, principal, resource_id, edition_id, state, expected=None):
    revision = identifier()
    text = canonical(state)
    if len(text) > 20000:
        raise StudyError('study_state_too_large', 413)
    if expected is None:
        c.execute('INSERT INTO study_resources(id,edition_id,owner_id,kind,visibility,context_id,current_revision) VALUES(?,?,?,?,?,?,?)',
                  (resource_id, edition_id, principal.id, KIND, 'private', identifier(), revision))
    else:
        changed = c.execute('UPDATE study_resources SET current_revision=? WHERE id=? AND current_revision=? AND deleted=0',
                            (revision, resource_id, expected))
        if changed.rowcount != 1:
            raise StudyError('stale_revision', 409)
    c.execute('INSERT INTO study_revisions VALUES(?,?,?,?,?)', (revision, resource_id, text, digest(text), store.clock()))
    store._event(c, principal, 'independent-study.saved', resource_id, {'revisionId': revision, 'sha256': digest(text)})
    return revision


def _raw(store, principal, resource_id):
    resource = store.get_resource(principal, resource_id)
    if principal.role != 'student' or resource['ownerId'] != principal.id or resource['kind'] != KIND:
        raise StudyError('forbidden', 403)
    issued = any(json.loads(r[0]) == {'revisionId': resource['revisionId'], 'sha256': resource['sha256']}
                 for r in store.connection.execute('SELECT payload FROM study_events WHERE resource_id=? AND actor_id=? AND kind=?',
                                                   (resource_id, principal.id, 'independent-study.saved')).fetchall())
    if not issued:
        raise StudyError('invalid_study_revision', 409)
    state = json.loads(resource['text'])
    pin = edition_pack(store, resource['editionId'])
    if any(pin[k] != state['packRef'][k] for k in state['packRef']):
        raise StudyError('coursepack_unavailable', 409)
    return resource, state


def _source(store, principal, state):
    ref = state['sourceRef']
    resource = store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])
    if resource['sha256'] != ref['sha256']:
        raise StudyError('stale_source', 409)
    return json.loads(resource['text'])


def _feedback(snapshot, lesson):
    phase = snapshot['phase']
    expected = evaluate_activity(lesson['activityId'], lesson[phase]['parameters'])
    answer = snapshot['answer']
    correct = answer['unit'] == expected['unit'] and math.isclose(answer['value'], expected['value'], rel_tol=1e-6, abs_tol=1e-9)
    return {'numericCorrect': correct, 'expectedValue': expected['value'], 'unit': expected['unit'],
            'reasoningStatus': 'NOT_AUTOMATICALLY_EVALUATED', 'mastery': 'NOT_INFERRED',
            'assistance': snapshot['assistance'],
            'message': 'Il valore e l’unità coincidono con il modello. Controlla anche il procedimento.' if correct else
                       'Valore o unità non coincidono con il modello. Controlla dati, unità e ipotesi, poi riprova.',
            'rubric': ['Dati e unità espliciti', 'Ipotesi del modello', 'Passaggi motivati e controllo del risultato']}


def _attempts(store, principal, resource, state, lesson):
    # The submission receipt, not client flags or a generic resource, is authority.
    found = []
    rows = store.connection.execute('SELECT payload FROM study_events WHERE actor_id=? AND resource_id=? AND kind=? ORDER BY created_at,id',
                                    (principal.id, resource['id'], 'independent-study.attempt-confirmed')).fetchall()
    for record in sorted((json.loads(row[0]) for row in rows), key=lambda record: record['ordinal']):
        receipt = get_receipt(store, principal, record['receiptId'])
        if record['cycle'] != state['cycle']:
            continue
        ref = record['sourceRef']
        snapshot = json.loads(store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])['text'])
        found.append({'receipt': receipt, 'sourceRef': ref, 'phase': snapshot['phase'],
                      'answer': snapshot['answer'], 'feedback': _feedback(snapshot, lesson)})
    return found


def _view(store, principal, resource, state):
    lesson = _source(store, principal, state)
    phase = state['phase']
    view = {**deepcopy(state), 'id': resource['id'], 'revisionId': resource['revisionId'],
            'title': lesson['title'], 'phases': list(PHASES), 'mastery': 'NOT_INFERRED',
            'editorialStatus': lesson['editorialStatus'], 'humanApproval': lesson['humanApproval'],
            'prerequisites': lesson.get('prerequisites', []), 'solutionVisible': False}
    view['attempts'] = _attempts(store, principal, resource, state, lesson)
    if phase in ('practice', 'transfer'):
        task = lesson[phase]
        view['task'] = {k: deepcopy(task[k]) for k in ('prompt', 'parameters')}
        view['task']['unit'] = task['answer']['unit']
    if phase in ('explanation', 'recovery'):
        view['source'] = {k: deepcopy(lesson.get(k, [])) for k in ('explanation', 'recap')}
    if phase == 'simulation':
        parameters = state.get('simulationParameters', lesson['practice']['parameters'])
        view['simulation'] = {'parameters': parameters, 'controls': lesson['controls'], 'activityId': lesson['activityId']}
        if state.get('simulationSeen'):
            view['simulation']['result'] = evaluate_activity(lesson['activityId'], parameters)
    if state.get('hintLevel', 0) and phase in ('practice', 'transfer'):
        hints = ['Identifica la grandezza richiesta e controlla le unità prima del calcolo.',
                 *lesson['explanation'][:1], lesson['workedExample']['prompt']]
        view['hints'] = hints[:state['hintLevel']]
    return view


def resume(store, principal, resource_id):
    resource, state = _raw(store, principal, resource_id)
    return _view(store, principal, resource, state)


def catalog(store, principal, edition_id):
    pin, items = lessons(store, principal, edition_id)
    sessions = []
    for row in store.connection.execute('SELECT id FROM study_resources WHERE edition_id=? AND owner_id=? AND kind=? AND deleted=0',
                                        (edition_id, principal.id, KIND)).fetchall():
        resource, state = _raw(store, principal, row[0])
        sessions.append({'id': resource['id'], 'lessonRef': state['lessonRef'], 'phase': state['phase'],
                         'reviewAt': state['reviewAt'], 'reason': state['reviewReason'], 'tutorRequest': state['tutorRequest']})
    sessions.sort(key=lambda s: (s['reviewAt'] is None, s['reviewAt'] or 0, s['id']))
    return {'schemaVersion': 1, 'packRef': pin, 'sessions': sessions,
            'objectives': [{k: l[k] for k in ('title', 'objectiveIds', 'lessonRef', 'humanApproval', 'editorialStatus', 'prerequisites')}
                           for l in items],
            'reason': 'Riprendi il percorso iniziato o scegli liberamente un obiettivo. I ripassi hanno una data modificabile.',
            'coverageWarning': 'Esempi circoscritti DRAFT: nessuna approvazione scientifica attestata, nessun corso completo.'}


def start(store, principal, edition_id, lesson_ref, key):
    if not isinstance(key, str) or not 1 <= len(key) <= 180:
        raise StudyError('idempotency_key_required')
    pin, lesson = resolve(store, principal, edition_id, lesson_ref)
    # Exact editorial bytes remain a Core resource even after a bundle changes.
    source = store.create_resource(principal, edition_id, 'independent-study-source-v1', canonical(lesson), key='s06-source-'+key)
    state = {'schemaVersion': 1, 'editionId': edition_id, 'packRef': pin, 'lessonRef': lesson_ref,
             'sourceRef': {'resourceId': source['id'], 'revisionId': source['revisionId'], 'sha256': source['sha256']},
             'phase': 'diagnostic', 'diagnostic': '', 'phaseSupport': [], 'assistanceHistory': [], 'hintLevel': 0,
             'simulationSeen': False, 'cycle': 0, 'confirmedCount': 0, 'pendingAttempt': None, 'tutorRequest': None, 'dispute': None,
             'reviewAt': None, 'reviewReason': 'Obiettivo scelto da te; nessuna competenza inferita.'}
    def apply(c):
        resource_id = identifier()
        _write(store, c, principal, resource_id, edition_id, state)
        return resume(store, principal, resource_id)
    return transact(store, principal, 'independent-study.started', key,
                    {'editionId': edition_id, 'lessonRef': lesson_ref}, apply)


def act(store, principal, resource_id, expected_revision, action, fields, key):
    resource, state = _raw(store, principal, resource_id)
    if not isinstance(fields, dict):
        raise StudyError('invalid_study_action')
    payload = {'id': resource_id, 'revisionId': expected_revision, 'action': action, 'fields': fields}
    try:
        if len(canonical(payload)) > 16000:
            raise StudyError('invalid_study_action')
    except (ValueError, TypeError):
        raise StudyError('invalid_study_action') from None
    def apply(c):
        store.lock_aggregate(c, 'independent-study', resource_id)
        current, value = _raw(store, principal, resource_id)
        if current['revisionId'] != expected_revision:
            raise StudyError('stale_revision', 409)
        if value['pendingAttempt'] is not None:
            raise StudyError('study_attempt_pending', 409)
        phase = value['phase']
        attempts = _attempts(store, principal, current, value, _source(store, principal, value))
        if action == 'diagnostic' and phase == 'diagnostic':
            value['diagnostic'] = _text(fields.get('text'))
            value['phase'] = 'explanation'
        elif action == 'simulate' and phase == 'simulation':
            lesson = _source(store, principal, value)
            parameters = fields.get('parameters', lesson['practice']['parameters'] if fields.get('caseIndex') == 0 else None)
            if (not isinstance(parameters, dict) or set(parameters) != set(lesson['controls'])
                    or any(v not in lesson['controls'][k] for k, v in parameters.items())):
                raise StudyError('invalid_study_simulation')
            evaluate_activity(lesson['activityId'], parameters)
            value['simulationParameters'] = parameters
            value['simulationSeen'] = True
        elif action == 'hint' and phase in ('practice', 'transfer'):
            level = min(value['hintLevel'] + 1, 3)
            value['hintLevel'] = level
            support = 'hint-' + str(level)
            if support not in value['phaseSupport']:
                value['phaseSupport'].append(support)
                value['assistanceHistory'].append({'phase': phase, 'cycle': value['cycle'], 'support': support})
        elif action == 'recover' and phase in ('practice', 'transfer') and any(a['phase'] == phase for a in attempts):
            value['phase'] = 'recovery'
        elif action == 'next':
            next_phase = {'explanation': 'simulation', 'simulation': 'practice', 'recovery': 'transfer'}
            if phase not in next_phase:
                raise StudyError('study_phase_conflict', 409)
            value['phase'] = next_phase[phase]
            value['phaseSupport'] = []
            value['hintLevel'] = 0
            if phase == 'simulation' and value['simulationSeen']:
                value['phaseSupport'] = ['simulation']
                value['assistanceHistory'].append({'phase': 'practice', 'cycle': value['cycle'], 'support': 'simulation'})
        elif action == 'finish' and phase == 'transfer' and any(a['phase'] == 'transfer' for a in attempts):
            last = next(a for a in reversed(attempts) if a['phase'] == 'transfer')
            value['phase'] = 'review'
            assisted = bool(last['feedback']['assistance']['observed'])
            days = 3 if last['feedback']['numericCorrect'] and not assisted else 1
            value['reviewAt'] = store.clock() + days * 86400
            value['reviewReason'] = ('Nuova prova numerica senza aiuti richiesti in questa fase: ripasso suggerito fra 3 giorni.'
                                     if days == 3 else 'Errore numerico o prova assistita: ripasso suggerito domani.')
        elif action == 'schedule' and type(fields.get('days')) is int and fields['days'] in (1, 3, 7, 14):
            value['reviewAt'] = store.clock() + fields['days'] * 86400
            value['reviewReason'] = 'Data scelta da te: ripasso fra ' + str(fields['days']) + ' giorni; nessuna mastery inferita.'
        elif action in ('tutor', 'dispute'):
            value['tutorRequest' if action == 'tutor' else 'dispute'] = {'text': _text(fields.get('text')), 'status': 'RECORDED_NOT_SENT'}
        elif action == 'restart' and phase == 'review':
            value['phase'] = 'diagnostic'; value['cycle'] += 1
            value['phaseSupport'] = []; value['hintLevel'] = 0; value['simulationSeen'] = False
        else:
            raise StudyError('study_phase_conflict', 409)
        _write(store, c, principal, resource_id, current['editionId'], value, current['revisionId'])
        return resume(store, principal, resource_id)
    return transact(store, principal, 'independent-study.updated', key, payload, apply)


def attempt(store, principal, resource_id, expected_revision, answer, key):
    resource, state = _raw(store, principal, resource_id)
    if (not isinstance(answer, dict) or set(answer) != {'value', 'unit', 'reasoning'}
            or type(answer['value']) not in (int, float) or not -1e100 <= answer['value'] <= 1e100
            or not isinstance(answer['unit'], str) or not 1 <= len(answer['unit']) <= 32):
        raise StudyError('invalid_study_answer')
    _text(answer['reasoning'])  # Validate without changing the idempotent bytes.
    payload = {'id': resource_id, 'revisionId': expected_revision, 'answer': answer}
    if not isinstance(key, str) or not 1 <= len(key) <= 180:
        raise StudyError('idempotency_key_required')
    # A confirmed request can be replayed after later navigation, but never after
    # revocation/another owner or with changed input.
    prior = lookup_receipt(store.connection, principal.id, 'independent-study.attempt', key, digest(canonical(payload)))
    if prior is not None:
        return prior
    pending = state['pendingAttempt']
    if pending is not None and (pending['key'] != key or pending['payloadHash'] != digest(canonical(payload))):
        raise StudyError('study_attempt_pending', 409)
    if pending is None and resource['revisionId'] != expected_revision:
        raise StudyError('stale_revision', 409)
    phase = state['phase']
    if phase not in ('practice', 'transfer'):
        raise StudyError('study_phase_conflict', 409)
    # Reserve this exact revision before the multi-command canonical submission.
    # Other tabs cannot reveal a hint while the frozen attempt is in flight.
    # If a process dies, GET exposes this request for an explicit same-key retry.
    def prepare(c):
        store.lock_aggregate(c, 'independent-study', resource_id)
        current, value = _raw(store, principal, resource_id)
        if current['revisionId'] != expected_revision or value['pendingAttempt'] is not None:
            raise StudyError('stale_revision', 409)
        value['pendingAttempt'] = {'key': key, 'payloadHash': digest(canonical(payload)),
                                   'revisionId': expected_revision, 'answer': answer}
        _write(store, c, principal, resource_id, current['editionId'], value, current['revisionId'])
        return {'prepared': True}
    transact(store, principal, 'independent-study.attempt-prepared', key, payload, prepare)
    resource, state = _raw(store, principal, resource_id)
    lesson = _source(store, principal, state)
    snapshot = {'schemaVersion': 1, 'sessionId': resource_id, 'sessionRevision': expected_revision,
                'lessonRef': state['lessonRef'], 'packRef': state['packRef'], 'cycle': state['cycle'],
                'phase': phase, 'answer': answer, 'assistance': {'observed': state['phaseSupport'],
                'history': state['assistanceHistory'], 'external': 'UNKNOWN'}}
    original = store.create_resource(principal, resource['editionId'], 'independent-study-attempt-v1', canonical(snapshot), key='s06-attempt-source-'+key)
    ref = {k: original[v] for k, v in (('resourceId', 'id'), ('revisionId', 'revisionId'), ('contextId', 'contextId'))}
    receipt = submit(store, principal, resource['editionId'], lesson['activityId'], [],
                     answer['reasoning'], 's06-submit-'+key, source_refs=[ref, {k: state['sourceRef'][k] for k in ('resourceId', 'revisionId')}],
                     activity_parameters=lesson[phase]['parameters'])
    body = {'receipt': receipt, 'sourceRef': ref, 'feedback': _feedback(snapshot, lesson)}
    def confirm(c):
        store.lock_aggregate(c, 'independent-study', resource_id)
        current, value = _raw(store, principal, resource_id)
        if value['pendingAttempt'] is None or value['pendingAttempt']['key'] != key:
            raise StudyError('study_attempt_pending', 409)
        value['confirmedCount'] += 1
        store._event(c, principal, 'independent-study.attempt-confirmed', resource_id,
                     {'receiptId': receipt['receiptId'], 'sourceRef': ref, 'cycle': state['cycle'], 'ordinal': value['confirmedCount']})
        value['pendingAttempt'] = None
        if 'previous-feedback' not in value['phaseSupport']:
            value['phaseSupport'].append('previous-feedback')
            value['assistanceHistory'].append({'phase': phase, 'cycle': state['cycle'], 'support': 'previous-feedback'})
        _write(store, c, principal, resource_id, current['editionId'], value, current['revisionId'])
        return body
    return transact(store, principal, 'independent-study.attempt', key, payload, confirm)
