"""Personal error diary, replayed from the canonical study_events ledger.

Commands persist versioned evidence and atomic idempotency receipts in StudyStore.
Only error.observed opens confirmed debt; only a tutor-reviewed transfer emits
exercise.completed. No provider can certify resolution or expand source access.
"""
import json
from .models import StudyError
from .store import canonical, identifier
from .transactions import transact
from .feedback import submission_for_actor, validate_sources

CATEGORIES = frozenset(('misconception', 'model_selection', 'procedure', 'algebra',
    'sign', 'units', 'arithmetic', 'reading_or_transcription', 'ambiguous_question', 'other'))
KINDS = frozenset(('error.proposed.v1', 'error.observed', 'error.contested.v1',
    'error.dismissed.v1', 'error.transfer_attempted.v1', 'exercise.completed'))
OPEN_STATES = frozenset(('OPEN', 'PRACTISING', 'RECURRED'))


def _text(value, code='invalid_diary_text', limit=4000):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise StudyError(code)
    return value


def _events(store):
    for row in store.connection.execute('SELECT * FROM study_events ORDER BY seq'):
        if row['kind'] not in KINDS:
            continue
        payload = json.loads(row['payload'])
        if payload.get('diaryVersion') == 1:
            yield row, payload


def _project(store):
    threads = {}
    for row, payload in _events(store):
        thread_id = payload['threadId']
        if row['kind'] == 'error.proposed.v1':
            threads[thread_id] = {**payload['thread'], 'status': 'CANDIDATE',
                'contested': False, 'contestReasons': [], 'observations': [],
                'observedCount': 0, 'feedback': None, 'transferExercise': None,
                'attempts': [], 'latestVerification': None, 'history': []}
        thread = threads.get(thread_id)
        if thread is None:
            continue  # No invented thread when provenance is absent.
        kind = row['kind']
        if kind == 'error.observed':
            thread['status'] = 'RECURRED' if payload['phase'] == 'recurrence' else 'OPEN'
            thread['verification'] = 'REVIEWED_BY_TUTOR'
            thread['observations'].append({**payload['observation'], 'eventSeq': row['seq']})
            thread['source'] = payload['observation']['source']
            thread['observedCount'] += 1
            if payload.get('feedback'):
                thread['feedback'] = payload['feedback']
                thread['transferExercise'] = payload['transferExercise']
        elif kind == 'error.contested.v1':
            thread['contested'] = True
            thread['contestReasons'].append({'reason': payload['reason'], 'actorId': row['actor_id']})
        elif kind == 'error.dismissed.v1':
            thread['status'] = 'DISMISSED'
            thread['dismissalReason'] = payload['reason']
        elif kind == 'error.transfer_attempted.v1':
            thread['status'] = 'PRACTISING'
            thread['attempts'].append({**payload['attempt'], 'eventSeq': row['seq']})
        elif kind == 'exercise.completed':
            thread['status'] = 'VERIFIED_RESOLVED'
            thread['latestVerification'] = payload['verification']
        thread['updatedAt'] = row['created_at']
        thread['history'].append({'seq': row['seq'], 'kind': kind,
            'actorId': row['actor_id'], 'occurredAt': row['created_at']})
    return threads


def _access(store, principal, thread, teacher_only=False):
    store._principal(principal)
    if principal.role == 'student' and principal.id == thread['studentId'] and not teacher_only:
        return
    store._edition_access(principal, thread['editionId'], teacher_only=True)
    if not store.connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',
            (thread['editionId'], thread['studentId'])).fetchone():
        raise StudyError('forbidden', 403)


def _thread(store, principal, thread_id, teacher_only=False):
    store._principal(principal)
    thread = _project(store).get(thread_id)
    if thread is None:
        raise StudyError('not_found', 404)
    _access(store, principal, thread, teacher_only)
    return thread


def _source_state(store, principal, source):
    try:
        store.get_resource_revision(principal, source['resourceId'], source['revisionId'])
    except StudyError:
        return 'UNAVAILABLE'
    row = store.connection.execute('SELECT current_revision FROM study_resources WHERE id=?', (source['resourceId'],)).fetchone()
    return 'CURRENT' if row[0] == source['revisionId'] else 'STALE'


def _visible(store, principal, thread):
    state = _source_state(store, principal, thread['source'])
    verification_state = state
    verification = thread['latestVerification']
    if verification:
        attempt = next(a for a in thread['attempts'] if a['attemptId'] == verification['attemptId'])
        states = [_source_state(store, principal, source) for source in attempt['sourceRefs']]
        if 'UNAVAILABLE' in states:
            verification_state = 'UNAVAILABLE'
        elif 'STALE' in states and verification_state == 'CURRENT':
            verification_state = 'STALE'
        if verification_state == 'UNAVAILABLE':
            thread['latestVerification'] = None
        if verification_state != 'CURRENT' and thread['status'] == 'VERIFIED_RESOLVED':
            thread['historicalStatus'] = thread['status']
            thread['status'] = 'PRACTISING'
    thread['verificationState'] = verification_state if verification else None
    thread['sourceState'] = state
    if state == 'UNAVAILABLE':
        thread['source'] = None
        thread['feedback'] = None
        thread['transferExercise'] = None
        thread['contestReasons'] = []
        thread.pop('dismissalReason', None)
        thread['latestVerification'] = None
    elif thread['feedback']:
        thread['feedback']['state'] = 'STALE' if state == 'STALE' else 'CURRENT'
    for observation in thread['observations']:
        observation_state = _source_state(store, principal, observation['source'])
        observation['sourceState'] = observation_state
        if observation_state == 'UNAVAILABLE':
            observation['source'] = None
            observation.pop('explanation', None)
    for attempt in thread['attempts']:
        visible = all(_source_state(store, principal, source) != 'UNAVAILABLE' for source in attempt['sourceRefs'])
        if not visible:
            attempt['procedure'] = None
            attempt['sourceRefs'] = []
        if state == 'UNAVAILABLE':
            attempt['procedure'] = None
    return thread


def get_thread(store, principal, thread_id):
    return _visible(store, principal, _thread(store, principal, thread_id))


def get_diary(store, principal, edition_id=None):
    store._principal(principal)
    if principal.role == 'teacher':
        if not edition_id:
            raise StudyError('edition_required')
        store._edition_access(principal, edition_id, teacher_only=True)
    elif edition_id:
        store._edition_access(principal, edition_id)
    visible = []
    for thread in _project(store).values():
        if principal.role == 'student' and thread['studentId'] != principal.id:
            continue
        if principal.role == 'teacher' and thread['editionId'] != edition_id:
            continue
        try:
            _access(store, principal, thread)
        except StudyError:
            continue
        visible.append(_visible(store, principal, thread))
    return {'threads': visible,
        'confirmedOpenCount': sum(t['status'] in OPEN_STATES for t in visible),
        'candidateCount': sum(t['status'] == 'CANDIDATE' for t in visible)}


def _emit(store, c, principal, kind, thread_id, payload, source=None):
    store._event(c, principal, kind, source['resourceId'] if source else None,
        {'diaryVersion': 1, 'threadId': thread_id, **payload})


def _command(store, principal, operation, key, payload, apply):
    # Receipts contain identifiers only: replay must not restore a revoked source
    # from a historical response body. The visible projection is rebuilt per read.
    receipt = transact(store, principal, 'diary.' + operation + '.v1', key, payload, apply)
    return get_thread(store, principal, receipt['threadId'])


def _anchor(store, principal, submission, anchor):
    if not isinstance(anchor, dict):
        raise StudyError('invalid_anchor')
    if not any(ref.get('resourceId') == anchor.get('resourceId') and ref.get('revisionId') == anchor.get('revisionId')
            for ref in json.loads(submission['source_refs'])):
        raise StudyError('source_not_in_submission', 403)
    source = store.get_resource_revision(principal, anchor['resourceId'], anchor['revisionId'])
    if source['ownerId'] != submission['student_id']:
        raise StudyError('source_owner_mismatch', 403)
    start, end = anchor.get('start'), anchor.get('end')
    if type(start) is not int or type(end) is not int or not 0 <= start < end <= len(source['text']):
        raise StudyError('invalid_anchor')
    if source['text'][start:end] != anchor.get('quote'):
        raise StudyError('anchor_quote_mismatch')
    return {'resourceId': source['id'], 'revisionId': source['revisionId'],
        'sha256': source['sha256'], 'start': start, 'end': end, 'quote': anchor['quote']}


def _current(store, thread):
    validate_sources(store, [thread['source']])


def _state(thread, allowed):
    if thread['status'] not in allowed:
        raise StudyError('invalid_diary_transition', 409)


def propose_error(store, principal, submission_id, concept_id, category, anchor, key, author_type='manual'):
    submission_for_actor(store, principal, submission_id)
    payload = {'submissionId': submission_id, 'conceptId': concept_id, 'category': category, 'anchor': anchor, 'authorType': author_type}
    def apply(c):
        submission = submission_for_actor(store, principal, submission_id)
        _text(concept_id, 'invalid_concept', 128)
        if not isinstance(category, str) or category not in CATEGORIES or author_type not in ('manual', 'ai'):
            raise StudyError('invalid_error_observation')
        source = _anchor(store, principal, submission, anchor)
        validate_sources(store, [source])
        for existing in _project(store).values():
            if (existing['studentId'] == submission['student_id']
                    and existing['submissionId'] == submission_id
                    and existing['conceptId'] == concept_id and existing['category'] == category
                    and existing['source'] == source):
                return {'threadId': existing['threadId'], 'studentId': submission['student_id']}
        thread_id, observation_id = identifier(), identifier()
        thread = {'threadId': thread_id, 'observationId': observation_id,
            'studentId': submission['student_id'], 'editionId': submission['edition_id'],
            'conceptId': concept_id, 'category': category, 'source': source,
            'submissionId': submission_id, 'attemptRevision': submission['revision'],
            'originalExerciseId': submission['activity_id'],
            'verification': 'PROPOSED_AI' if author_type == 'ai' else 'UNVERIFIED'}
        _emit(store, c, principal, 'error.proposed.v1', thread_id, {'thread': thread, 'studentId': submission['student_id']}, source)
        return {'threadId': thread_id, 'studentId': submission['student_id']}
    return _command(store, principal, 'propose', key, payload, apply)


def _transfer_plan(thread, plan):
    if not isinstance(plan, dict):
        raise StudyError('transfer_plan_required')
    _text(plan.get('exerciseId'), 'invalid_exercise', 128)
    _text(plan.get('prompt'), 'invalid_exercise')
    for name in ('parameters', 'originalParameters'):
        if not isinstance(plan.get(name), dict) or not plan[name] or len(canonical(plan[name])) > 4000:
            raise StudyError('invalid_parameters')
    if plan['exerciseId'] == thread['originalExerciseId'] or canonical(plan['parameters']) == canonical(plan['originalParameters']):
        raise StudyError('distinct_exercise_required')
    return {name: plan[name] for name in ('exerciseId', 'prompt', 'parameters', 'originalParameters')}


def confirm_error(store, principal, thread_id, rubric, explanation, next_step, key, source_checked=False, transfer_exercise=None):
    _thread(store, principal, thread_id, True)
    payload = {'threadId': thread_id, 'rubric': rubric, 'explanation': explanation, 'nextStep': next_step,
        'sourceChecked': source_checked, 'transferExercise': transfer_exercise}
    def apply(c):
        thread = _thread(store, principal, thread_id, True)
        _state(thread, ('CANDIDATE',))
        _current(store, thread)
        if type(source_checked) is not bool:
            raise StudyError('invalid_source_check')
        if thread['category'] == 'ambiguous_question' and source_checked is not True:
            raise StudyError('source_check_required')
        if not isinstance(rubric, dict) or rubric.get('procedureRequired') is not True:
            raise StudyError('procedure_rubric_required')
        _text(rubric.get('criterion'), 'invalid_rubric')
        _text(explanation); _text(next_step)
        plan = _transfer_plan(thread, transfer_exercise)
        observation = {'observationId': thread['observationId'], 'submissionId': thread['submissionId'],
            'source': thread['source'], 'reviewerId': principal.id, 'verification': 'REVIEWED_BY_TUTOR'}
        _emit(store, c, principal, 'error.observed', thread_id, {'errorId': thread_id,
            'studentId': thread['studentId'], 'conceptId': thread['conceptId'], 'phase': 'confirmation',
            'observation': observation, 'feedback': {'explanation': explanation, 'rubric': rubric,
            'nextStep': next_step, 'verification': 'REVIEWED_BY_TUTOR', 'reviewerId': principal.id},
            'transferExercise': plan}, thread['source'])
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'confirm', key, payload, apply)


def contest_error(store, principal, thread_id, reason, key):
    _thread(store, principal, thread_id)
    def apply(c):
        thread = _thread(store, principal, thread_id)
        _text(reason)
        _emit(store, c, principal, 'error.contested.v1', thread_id, {'reason': reason, 'studentId': thread['studentId']})
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'contest', key, {'threadId': thread_id, 'reason': reason}, apply)


def dismiss_error(store, principal, thread_id, reason, key):
    _thread(store, principal, thread_id, True)
    def apply(c):
        thread = _thread(store, principal, thread_id, True)
        _state(thread, ('CANDIDATE', 'OPEN', 'PRACTISING', 'RECURRED'))
        _text(reason)
        _emit(store, c, principal, 'error.dismissed.v1', thread_id, {'reason': reason, 'studentId': thread['studentId']})
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'dismiss', key, {'threadId': thread_id, 'reason': reason}, apply)


def record_practice(store, principal, thread_id, submission_id, exercise_id, parameters, key):
    _thread(store, principal, thread_id)
    payload = {'threadId': thread_id, 'submissionId': submission_id, 'exerciseId': exercise_id, 'parameters': parameters}
    def apply(c):
        thread = _thread(store, principal, thread_id)
        _state(thread, OPEN_STATES)
        _current(store, thread)
        submission = submission_for_actor(store, principal, submission_id)
        if submission['student_id'] != thread['studentId'] or submission['edition_id'] != thread['editionId']:
            raise StudyError('forbidden', 403)
        used = {thread['submissionId']} | {item['submissionId'] for item in thread['observations']} | {item['submissionId'] for item in thread['attempts']}
        if submission_id in used:
            raise StudyError('distinct_attempt_required')
        plan = thread['transferExercise']
        if exercise_id != plan['exerciseId'] or canonical(parameters) != canonical(plan['parameters']):
            raise StudyError('transfer_plan_mismatch')
        if submission['activity_id'] != exercise_id:
            raise StudyError('activity_mismatch')
        committed = c.execute("SELECT body FROM study_receipts WHERE id=? AND actor_id=? AND operation='submission.received'",
            (submission['receipt_id'], thread['studentId'])).fetchone()
        context = json.loads(committed[0]).get('activityContext', {}) if committed else {}
        if (context.get('threadId') != thread_id or context.get('exerciseId') != exercise_id
                or canonical(context.get('parameters')) != canonical(plan['parameters'])):
            raise StudyError('transfer_receipt_mismatch')
        refs = json.loads(submission['source_refs'])
        validate_sources(store, refs)
        prior_sources = {o['source']['resourceId'] for o in thread['observations']}
        prior_sources.update(ref['resourceId'] for previous in thread['attempts'] for ref in previous['sourceRefs'])
        if any(ref['resourceId'] in prior_sources for ref in refs):
            raise StudyError('distinct_source_required')
        attempt = {'attemptId': identifier(), 'submissionId': submission_id, 'exerciseId': exercise_id,
            'parameters': parameters, 'procedure': submission['text'], 'sourceRefs': refs, 'status': 'UNVERIFIED'}
        _emit(store, c, principal, 'error.transfer_attempted.v1', thread_id, {'attempt': attempt, 'studentId': thread['studentId']})
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'practice', key, payload, apply)


def verify_transfer(store, principal, thread_id, attempt_id, rubric_evidence, key):
    _thread(store, principal, thread_id, True)
    payload = {'threadId': thread_id, 'attemptId': attempt_id, 'rubricEvidence': rubric_evidence}
    def apply(c):
        thread = _thread(store, principal, thread_id, True)
        _state(thread, ('PRACTISING',))
        _current(store, thread)
        attempt = next((a for a in thread['attempts'] if a['attemptId'] == attempt_id), None)
        if attempt is None:
            raise StudyError('attempt_not_found', 404)
        if attempt['eventSeq'] <= thread['observations'][-1]['eventSeq']:
            raise StudyError('new_evidence_required')
        validate_sources(store, attempt['sourceRefs'])
        if not isinstance(rubric_evidence, dict):
            raise StudyError('procedure_evidence_required')
        if rubric_evidence.get('criterion') != thread['feedback']['rubric']['criterion']:
            raise StudyError('rubric_mismatch')
        quote = rubric_evidence.get('procedureQuote')
        if not isinstance(quote, str) or len(quote.strip()) < 12 or quote not in attempt['procedure'] or not any(ch.isalpha() for ch in quote):
            raise StudyError('procedure_evidence_required')
        _text(rubric_evidence.get('reasoning'), 'procedure_evidence_required')
        _text(rubric_evidence.get('variationReason'), 'variation_evidence_required')
        verification = {'attemptId': attempt_id, 'submissionId': attempt['submissionId'],
            'reviewerId': principal.id, 'verification': 'REVIEWED_BY_TUTOR',
            'scope': 'Nuova prova e procedimento secondo la rubrica dichiarata; non padronanza permanente.',
            'rubricEvidence': rubric_evidence}
        _emit(store, c, principal, 'exercise.completed', thread_id, {'correctsErrorId': thread_id,
            'studentId': thread['studentId'], 'exerciseId': attempt['exerciseId'], 'verification': verification})
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'verify-transfer', key, payload, apply)


def record_recurrence(store, principal, thread_id, submission_id, anchor, explanation, key):
    _thread(store, principal, thread_id, True)
    payload = {'threadId': thread_id, 'submissionId': submission_id, 'anchor': anchor, 'explanation': explanation}
    def apply(c):
        thread = _thread(store, principal, thread_id, True)
        _state(thread, ('VERIFIED_RESOLVED',))
        _current(store, thread)
        submission = submission_for_actor(store, principal, submission_id, teacher_only=True)
        if submission['student_id'] != thread['studentId'] or submission['edition_id'] != thread['editionId']:
            raise StudyError('forbidden', 403)
        used = {thread['submissionId']} | {o['submissionId'] for o in thread['observations']} | {a['submissionId'] for a in thread['attempts']}
        if submission_id in used:
            raise StudyError('distinct_attempt_required')
        # Sequence, rather than a wall clock, is authoritative for "after".
        created = c.execute("SELECT seq FROM study_events WHERE kind='submission.received' AND json_extract(payload,'$.receiptId')=?", (submission['receipt_id'],)).fetchone()
        if created is None or created[0] <= thread['history'][-1]['seq']:
            raise StudyError('new_evidence_required')
        source = _anchor(store, principal, submission, anchor)
        validate_sources(store, [source]); _text(explanation)
        observation = {'observationId': identifier(), 'submissionId': submission_id, 'source': source,
            'reviewerId': principal.id, 'verification': 'REVIEWED_BY_TUTOR', 'explanation': explanation}
        _emit(store, c, principal, 'error.observed', thread_id, {'errorId': thread_id,
            'studentId': thread['studentId'], 'conceptId': thread['conceptId'],
            'phase': 'recurrence', 'observation': observation}, source)
        return {'threadId': thread_id, 'studentId': thread['studentId']}
    return _command(store, principal, 'recurrence', key, payload, apply)
