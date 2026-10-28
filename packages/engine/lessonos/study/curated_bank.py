"""Private synthetic access to canonical CoursePack references; never approval."""
from .catalog import edition_pack, load_pack
from .models import StudyError
from .store import canonical, digest

GATE = 'private-synthetic-curated-v1'
SCOPE = 'PRIVATE_SYNTHETIC_ACCEPTANCE'


def metadata():
    return {'editorialStatus':'DRAFT', 'scientificApproval':'NOT_RUN', 'humanApproval':False,
            'releaseScope':SCOPE, 'feedbackAuthority':'DRAFT_REFERENCE_NOT_HUMAN_APPROVAL'}


def project(payload):
    payload.update(metadata())
    if 'matchingPolicy' in payload:
        payload['matchingPolicy'] = payload['matchingPolicy'].replace('approved_aliases', 'reference_aliases')
    for item in payload.get('items', payload.get('questions', [])):
        item.update({'status':'DRAFT', 'humanApproval':False, 'releaseScope':SCOPE})
    if 'question' in payload:
        payload['question'].update({'status':'DRAFT', 'humanApproval':False, 'releaseScope':SCOPE})
    if 'publication' in payload:
        payload['publication'] = {'gate':GATE, 'defaultDeny':True, 'status':SCOPE,
                                  'publishedQuestionCount':0, 'syntheticQuestionCount':payload['questionCount']}
    return payload


def access(store, principal, edition_id, bank_id=None):
    if getattr(store, 'synthetic_acceptance', False) is not True or principal.role != 'student':
        return None
    store._edition_access(principal, edition_id)
    binding = edition_pack(store, edition_id)
    pack = load_pack(binding['packId'], binding['packVersion'])
    if digest(canonical(pack)) != binding['packSha256']:
        raise StudyError('coursepack_unavailable', 409)
    curated = pack.get('curatedPractice')
    if not isinstance(curated, dict) or (bank_id is not None and curated.get('bankId') != bank_id):
        return None
    from .question_bank import load_bank
    bank = load_bank(curated.get('bankId'))
    refs = curated.get('questionRefs')
    if (type(curated.get('bankVersion')) is not int or curated['bankVersion'] != bank.manifest['version'] or curated.get('manifestSha256') != bank.sha256
            or not isinstance(refs, list) or len(refs) != 199):
        raise StudyError('curated_bank_unavailable', 409)
    by_id = {}
    for ref in refs:
        if (not isinstance(ref, dict) or not isinstance(ref.get('id'), str) or ref['id'] in by_id
                or type(ref.get('version')) is not int or ref['version'] != bank.question_version(ref['id'])
                or ref.get('sha256') != bank.approval_content_sha256(ref['id'])):
            raise StudyError('curated_question_changed', 409)
        by_id[ref['id']] = ref
    return {'bank':bank, 'pack':pack, 'binding':binding, 'refs':by_id, 'ids':frozenset(by_id)}


def simulations(context):
    definitions = context['pack'].get('examSimulations', [])
    if not isinstance(definitions, list) or len(definitions) != 2:
        raise StudyError('exam_simulations_unavailable', 409)
    result = []
    for item in definitions:
        if not isinstance(item, dict):
            raise StudyError('exam_simulation_changed', 409)
        refs = item.get('questionRefs')
        if (not isinstance(item.get('id'), str) or not 1 <= len(item['id']) <= 128
                or item.get('profileId') != 'semestre-2026' or item.get('durationSeconds') != 3000
                or item.get('scoring') != {'correct':1, 'incorrect':-.1, 'omitted':0}
                or not isinstance(item.get('scopeWarning'), str) or not item['scopeWarning'].strip()
                or not isinstance(refs, list) or len(refs) != 31
                or any(not isinstance(ref, dict) or not isinstance(ref.get('id'), str) for ref in refs)
                or len({ref.get('id') for ref in refs}) != 31
                or any(ref != context['refs'].get(ref.get('id')) for ref in refs)):
            raise StudyError('exam_simulation_changed', 409)
        full = [context['bank'].review_record(ref['id']) for ref in refs]
        if sum(q['format']=='multiple_choice' for q in full) != 21 or sum(q['format']=='completion' for q in full) != 10:
            raise StudyError('exam_question_count_mismatch', 409)
        result.append(item)
    if len({item['id'] for item in result}) != 2:
        raise StudyError('exam_simulations_unavailable', 409)
    return result


def simulation_ref(item):
    return {'id':item['id'], 'version':1, 'sha256':digest(canonical(item))}
