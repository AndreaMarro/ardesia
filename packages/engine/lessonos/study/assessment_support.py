"""On-demand authored hints recorded in the existing command/event authority.

No grading, inferred autonomy, new ledger or client-provided support history.
"""
import math

from .models import StudyError
from .store import canonical, digest
from .transactions import execute_command

OPERATION = 'course.assessment.support'
MAX_HINTS = 8
MAX_HINT_LENGTH = 8000


def authored_hints(item, phase):
    source = item if phase == 'practice' else item.get('transfer', {})
    hints = source.get('hints', [])
    if (not isinstance(hints, list) or len(hints) > MAX_HINTS
            or any(not isinstance(hint, str) or not hint.strip() or len(hint) > MAX_HINT_LENGTH for hint in hints)):
        raise StudyError('course_assessment_support_unavailable', 409)
    return hints


def hint_kind(item, phase, text):
    # Label canonical answer-bearing hints explicitly; never synthesize answers.
    answer = item.get('answer') if phase == 'practice' else item.get('transfer', {}).get('expectedEvidence')
    return 'EXPLICIT_HINT' if isinstance(answer, str) and answer.strip() and answer in text else 'HINT'


def _lock_scope(store, connection, principal, edition_id, context):
    scope = {'actorId':principal.id, 'editionId':edition_id,
             **{key:context[key] for key in ('lessonRef','assessmentRef','phase')}}
    store.lock_aggregate(connection, OPERATION, digest(canonical(scope)))


def request_support(store, principal, edition_id, assessment_id, course_lesson, level, key):
    """Return exactly one selected hint after recording its authorized request."""
    store._edition_access(principal, edition_id)
    from .four_courses import synthetic_learner
    if not synthetic_learner(store, principal):
        raise StudyError('course_assessment_support_unavailable', 403)
    if type(level) is not int or not 1 <= level <= MAX_HINTS:
        raise StudyError('invalid_support_level')
    validated = {}

    def authorize(connection):
        from .course_lesson_context import freeze_course_lesson, resolve_assessment
        from .catalog import edition_pack, load_pack
        context = freeze_course_lesson(store,principal,edition_id,'course-reasoning-v1',course_lesson,{})
        if context is None or 'assessmentRef' not in context:
            raise StudyError('invalid_course_assessment')
        if assessment_id != context['assessmentRef']['id']:
            raise StudyError('course_assessment_support_mismatch',409)
        binding = edition_pack(store,edition_id)
        _, item = resolve_assessment(load_pack(binding['packId'],binding['packVersion']),context['assessmentRef'])
        hints = authored_hints(item,context['phase'])
        if not hints:
            raise StudyError('course_assessment_support_unavailable',409)
        if level > len(hints):
            raise StudyError('invalid_support_level')
        _lock_scope(store,connection,principal,edition_id,context)
        validated.update(context=context,binding=binding,item=item,hints=hints)

    def apply(connection):
        context,item,hints = (validated[key] for key in ('context','item','hints'))
        text = hints[level-1]
        return {'assessmentRef':context['assessmentRef'], 'phase':context['phase'],
                'level':level, 'hintCount':len(hints), 'text':text,
                'kind':hint_kind(item,context['phase'],text), 'assistanceRecorded':True}

    def record_event(connection, body, receipt_id):
        context = validated['context']
        store._event(connection,principal,OPERATION,None,{
            'receiptId':receipt_id,'editionId':edition_id,
            'packSha256':validated['binding']['packSha256'],
            **{key:context[key] for key in ('lessonRef','assessmentRef','phase')},
            'level':level,'kind':body['kind']})

    return execute_command(store,principal,OPERATION,key,
                           {'editionId':edition_id,'assessmentId':assessment_id,'courseLesson':course_lesson,'level':level},
                           apply,before_lookup=authorize,receipt_recorded=record_event)


def freeze_assistance(store, connection, principal, edition_id, context):
    """Freeze earliest recorded use per level for this exact actor/reference.

    All requests remain in the event ledger; the receipt summary is bounded.
    No recorded help is an observation about this ledger, never independence.
    The shared aggregate lock orders hint requests against submission snapshots.
    """
    from .catalog import edition_pack, load_pack
    from .course_lesson_context import resolve_assessment
    binding = edition_pack(store,edition_id)
    _, item = resolve_assessment(load_pack(binding['packId'],binding['packVersion']),context['assessmentRef'])
    hints = authored_hints(item,context['phase'])
    _lock_scope(store,connection,principal,edition_id,context)
    rows = connection.execute("""SELECT json_extract(payload,'$.level') AS level, MIN(created_at) AS requested_at
        FROM study_events WHERE actor_id=? AND kind=?
        AND json_extract(payload,'$.editionId')=? AND json_extract(payload,'$.packSha256')=?
        AND json_extract(payload,'$.lessonRef.id')=? AND json_extract(payload,'$.lessonRef.sha256')=?
        AND json_extract(payload,'$.assessmentRef.id')=? AND json_extract(payload,'$.assessmentRef.sha256')=?
        AND json_extract(payload,'$.phase')=?
        GROUP BY json_extract(payload,'$.level') LIMIT ?""",
        (principal.id,OPERATION,edition_id,binding['packSha256'],context['lessonRef']['id'],context['lessonRef']['sha256'],
         context['assessmentRef']['id'],context['assessmentRef']['sha256'],context['phase'],MAX_HINTS+1)).fetchall()
    events = []
    for row in rows:
        try:
            level = int(row['level'])
            timestamp = float(row['requested_at'])
            if (str(level) != str(row['level']) or not 1 <= level <= len(hints)
                    or not math.isfinite(timestamp) or timestamp < 0):
                raise ValueError('invalid support event')
        except (ValueError,TypeError,OverflowError):
            raise StudyError('assistance_history_unavailable',503) from None
        events.append({'level':level,'kind':hint_kind(item,context['phase'],hints[level-1]),'requestedAt':timestamp})
    if len(events) > MAX_HINTS:
        raise StudyError('assistance_history_unavailable',503)
    return {'recorded':bool(events),'scope':'CUMULATIVE_PRIOR_HELP','events':sorted(events,key=lambda event:event['level'])}
