"""Bank-backed exam packs: approved questions only, frozen at attempt start.

A bound question bank is authoritative from the first request. The legacy pack
is available only to editions whose CoursePack binds no bank at all, so a
student can never reach unapproved legacy content through a pending review.
"""
from copy import deepcopy
from fractions import Fraction

from .models import StudyError
from .question_bank import load_bank, bank_access_for_edition
from .question_bank_approvals import ApprovalGate, GATE_ID
from .store import canonical

from . import exam as exam_engine
from .exam import BANK_PROFILE_ID, CORRECT_TENTHS, TOTAL_QUESTIONS


def bank_pack_id(bank_id, profile_id=BANK_PROFILE_ID):
    return f'{bank_id}-{profile_id}-v1'


def bound_bank_id(edition):
    """Return the first bank pinned by the edition's CoursePack.

    Binding alone activates the bank path. Approval readiness is checked by
    ``build_bank_pack``; a pending or partial review fails closed and never
    falls back to the unapproved legacy paper.
    """
    return next((bank_id for bank_id in edition.get('questionBankIds', [])
                 if isinstance(bank_id, str) and bank_id), None)


def _profile(bank, profile_id):
    profiles = bank.manifest.get('examProfiles', [])
    if isinstance(profiles, dict):
        profiles = [dict(value, id=key) for key, value in profiles.items()]
    for profile in profiles:
        if profile.get('id') == profile_id:
            return profile
    raise StudyError('invalid_exam_profile')


def _rules(profile):
    scoring = profile.get('scoring', {})
    return {
        'totalQuestions': TOTAL_QUESTIONS,
        'mcq': profile['multipleChoice'],
        'completion': profile['completion'],
        'correctTenths': CORRECT_TENTHS,
        'wrongTenths': -1,
        'omittedTenths': 0,
        'maxTenths': TOTAL_QUESTIONS * CORRECT_TENTHS,
        'scoring': 'Risposta corretta +1,00; risposta errata -0,10; risposta omessa 0,00.',
        'maxScore': scoring.get('correct', 1) * TOTAL_QUESTIONS,
    }


def _accepted(answer):
    aliases = []
    for value in (answer.get('text'), answer.get('exact'), *answer.get('accepted', [])):
        if isinstance(value, str) and value.strip() and len(value) <= exam_engine.MAX_ANSWER_LENGTH:
            if value not in aliases:
                aliases.append(value)
    if not aliases:
        raise StudyError('exam_question_invalid', 409)
    return aliases[:20]


def _numeric(answer):
    exact = answer.get('exact')
    if answer.get('kind') != 'rational' or not isinstance(exact, str):
        return None
    try:
        value = float(Fraction(exact.replace(',', '.')))
    except (ValueError, ZeroDivisionError, OverflowError):
        raise StudyError('exam_question_invalid', 409) from None
    unit = answer.get('unit') or '1'
    return {'value': value, 'exact': exact, 'unit': unit, 'tolerance': 0, 'units': [unit]}


def _question(full, approval):
    if full['format'] == 'multiple_choice':
        options = [option['text'] for option in full['options']]
        if len(options) != 5 or full['answer'].get('correctOptionId') not in 'ABCDE':
            raise StudyError('exam_question_invalid', 409)
        answer = full['answer']['correctOptionId']
        accepted = None
        numeric = None
    else:
        options = []
        answer = None
        accepted = _accepted(full['answer'])
        numeric = _numeric(full['answer'])
    return {
        'id': full['id'],
        'version': full['version'],
        'questionVersion': full['version'],
        'topic': full['taxonomy'].get('topic') or full.get('title') or 'Fisica',
        'familyId': full['familyId'],
        'type': 'mcq' if full['format'] == 'multiple_choice' else 'completion',
        'prompt': full['prompt'],
        'options': options,
        'answer': answer,
        'accepted': accepted,
        'numeric': numeric,
        'explanation': full['solution'],
        'solutionSteps': deepcopy(full['solutionSteps']),
        'taxonomy': dict(full['taxonomy']),
        'approvalId': approval['approvalId'],
        'contentSha256': approval['contentSha256'],
    }


def build_bank_pack(store, principal, edition, edition_id, seed, *, profile_id=BANK_PROFILE_ID):
    bank_id = bound_bank_id(edition)
    if bank_id is None:
        return None
    _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
    profile = _profile(bank, profile_id)
    if (profile.get('questionCount') != TOTAL_QUESTIONS
            or profile.get('multipleChoice') != exam_engine.MCQ_COUNT
            or profile.get('completion') != exam_engine.COMPLETION_COUNT
            or profile.get('durationSeconds') != exam_engine.DURATION_SECONDS):
        raise StudyError('exam_profile_mismatch', 409)
    gate = ApprovalGate(store, bank, edition_id)
    approvals = gate.servable_approvals()
    if len(approvals) < TOTAL_QUESTIONS:
        raise StudyError('exam_not_ready', 409)
    try:
        selection = bank.exam(seed, profile_id=profile_id, published_ids=frozenset(approvals))
    except StudyError as error:
        if error.code in ('insufficient_distinct_families', 'invalid_exam_profile'):
            raise StudyError('exam_not_ready', 409) from None
        raise
    question_ids = [question['id'] for question in selection['questions']]
    if len(question_ids) != TOTAL_QUESTIONS:
        raise StudyError('exam_not_ready', 409)
    questions = []
    for question_id in question_ids:
        approval = approvals.get(question_id)
        if approval is None:
            raise StudyError('exam_not_ready', 409)
        questions.append(_question(bank.review_record(question_id), approval))
    return {
        'schemaVersion': exam_engine.PACK_SCHEMA_BANK,
        'id': bank_pack_id(bank_id, profile_id),
        'version': exam_engine.PACK_VERSION,
        'title': 'Fisica — Prova di semestre',
        'subtitle': '31 quesiti approvati · 21 scelte + 10 completamenti',
        'durationSeconds': exam_engine.DURATION_SECONDS,
        'rules': _rules(profile),
        'provenance': (
            'Prova composta solo da quesiti della banca approvati dal docente '
            'per questa edizione; lo snapshot resta congelato all\'avvio.'
        ),
        'bank': {
            'id': bank_id,
            'sha256': bank.sha256,
            'profileId': profile_id,
            'seed': seed,
            'gate': GATE_ID,
        },
        'questions': questions,
    }


def pack_summary(store, edition, edition_id):
    """Listing projection for an activated bank, without sampling questions."""
    bank_id = bound_bank_id(edition)
    if bank_id is None:
        return None
    bank = load_bank(bank_id)
    profile = _profile(bank, BANK_PROFILE_ID)
    approved_count = len(ApprovalGate(store, bank, edition_id).servable_approvals())
    ready = approved_count >= TOTAL_QUESTIONS
    return {
        'id': bank_pack_id(bank_id, BANK_PROFILE_ID),
        'version': exam_engine.PACK_VERSION,
        'schemaVersion': exam_engine.PACK_SCHEMA_BANK,
        'title': 'Fisica — Prova di semestre',
        'subtitle': ('31 quesiti approvati · 21 scelte + 10 completamenti'
                     if ready else
                     f'{approved_count}/31 quesiti approvati · prova non disponibile'),
        'ready': ready,
        'approvedCount': approved_count,
        'durationSeconds': profile['durationSeconds'],
        'rules': _rules(profile),
        'provenance': (
            'Prova composta solo da quesiti della banca approvati dal docente '
            'per questa edizione; lo snapshot resta congelato all\'avvio.'
        ),
        'questionCount': TOTAL_QUESTIONS,
        'bank': {'id': bank_id, 'profileId': BANK_PROFILE_ID},
    }


def result_validity(store, edition_id, pack):
    """Recheck the approvals frozen in a snapshot without trusting a client."""
    if exam_engine._pack_schema(pack) != exam_engine.PACK_SCHEMA_BANK:
        return None
    try:
        bank = load_bank(pack['bank']['id'])
        gate = ApprovalGate(store, bank, edition_id)
        approvals = gate.servable_approvals()
        revoked = gate.revoked_approval_ids(
            [question['approvalId'] for question in pack['questions']])
        invalid = []
        for question in pack['questions']:
            approval = approvals.get(question['id'])
            if (approval is None or approval['approvalId'] in revoked
                    or approval['questionVersion'] != question['questionVersion']
                    or approval['contentSha256'] != question['contentSha256']):
                invalid.append(question['id'])
        return {
            'valid': not invalid,
            'checkedAt': store.clock(),
            'invalidQuestionIds': invalid,
            'gate': GATE_ID,
        }
    except StudyError:
        return {
            'valid': False,
            'checkedAt': store.clock(),
            'invalidQuestionIds': [question['id'] for question in pack['questions']],
            'gate': GATE_ID,
            'reason': 'approval_gate_unavailable',
        }


def snapshot_fingerprint(pack):
    return canonical(pack)
