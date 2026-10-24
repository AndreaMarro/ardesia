"""Editorial composition over pinned CoursePacks and canonical submission receipts.

No attempts, review decisions or permissions live in this manifest. Predictions
are student reports; numeric checks use the existing activity evaluator.
"""
import json
import math
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
from .activities import evaluate_activity
from .catalog import edition_pack, load_pack
from .models import StudyError
from .store import canonical


def list_experiences(store, principal, edition_id):
    store._edition_access(principal, edition_id)
    binding = edition_pack(store, edition_id)
    pack = load_pack(binding['packId'], binding['packVersion'])
    items = {item['id']: item for item in pack['exercises'] +
             [item for group in pack['transferTests'] for item in group['items']]}
    resolved = []
    # Additive editorial revision. Keep old IDs and parameters resolvable for
    # existing receipts/retries; the new version is the default in the UI.
    manifests = []
    for version in (2, 1):
        manifests.extend(json.loads((Path(__file__).parent / 'content' / f'learning-experiences-v{version}.json').read_text())['experiences'])
    for manifest in manifests:
        if (manifest['packId'], manifest['packVersion']) != (binding['packId'], binding['packVersion']):
            continue
        steps = []
        for step in manifest['steps']:
            source = items[step['exerciseRef']] if 'exerciseRef' in step else step
            evaluate_activity(source['activityId'], source['parameters'])
            steps.append({**step, **{key: source[key] for key in ('activityId', 'parameters', 'prompt')}})
        resolved.append({key: manifest[key] for key in ('id', 'title', 'objective')} |
                        {'steps': steps, 'editorialStatus': 'DRAFT', 'scientificApproval': 'NOT_ATTESTED'})
    return {'schemaVersion': 1, 'coursePackRef': {key: binding[key] for key in
            ('packId', 'packVersion', 'packSha256')}, 'experiences': resolved}


def validate_lesson_passage(value):
    """Validate a declared local Studio reference, without claiming media access."""
    invalid = StudyError('invalid_lesson_passage')
    keys = {'schema', 'workspaceId', 'lessonId', 'sessionId', 'recordingId', 'startEpoch',
            'endEpoch', 'sha256', 'objectRefs', 'replayUrl'}
    if not isinstance(value, dict) or set(value) != keys or value.get('schema') != 'ardesia.lesson-passage.v1':
        raise invalid
    if value['workspaceId'] != 'local-default':
        raise invalid
    for key in ('lessonId', 'sessionId', 'recordingId'):
        if not isinstance(value[key], str) or not 1 <= len(value[key]) <= 128:
            raise invalid
    for key in ('startEpoch', 'endEpoch'):
        if type(value[key]) is not int or not 0 <= value[key] < 2**53:
            raise invalid
    if value['endEpoch'] < value['startEpoch']:
        raise invalid
    sha = value['sha256']
    if not isinstance(sha, str) or len(sha) != 64 or any(ch not in '0123456789abcdef' for ch in sha):
        raise invalid
    refs = value['objectRefs']
    if not isinstance(refs, list) or not 1 <= len(refs) <= 20:
        raise invalid
    for ref in refs:
        if (not isinstance(ref, dict) or set(ref) != {'elementId', 'version', 'label'}
                or not isinstance(ref['elementId'], str) or not 1 <= len(ref['elementId']) <= 128
                or type(ref['version']) is not int or ref['version'] < 1
                or not isinstance(ref['label'], str) or not 1 <= len(ref['label']) <= 500):
            raise invalid
    if not isinstance(value['replayUrl'], str) or len(value['replayUrl']) > 2000:
        raise invalid
    try:
        url = urlparse(value['replayUrl'])
        # Accessing port validates both its spelling and range in urllib.
        url.port
        query = parse_qs(url.query)
        at = query.get('at', [])
        if (url.scheme not in ('http', 'https') or url.hostname not in ('localhost', '127.0.0.1', '::1')
                or url.username or url.password or url.path not in ('', '/', '/studio/')
                or query.get('vista') != ['replay'] or len(at) != 1 or not at[0].isdigit()
                or not value['startEpoch'] <= int(at[0]) <= value['endEpoch']
                or query.get('recording') != [value['recordingId']]
                or query.get('object') != [refs[0]['elementId']]
                or query.get('session') != [value['sessionId']] or query.get('sha') != [sha]
                or query.get('objectVersion') != [str(refs[0]['version'])]
                or unquote(url.fragment) != value['lessonId']):
            raise invalid
    except ValueError:
        raise invalid from None
    return value


def lesson_passage_resource(store, principal, edition_id, reference):
    if (not isinstance(reference, dict) or set(reference) != {'resourceId', 'revisionId'}
            or not all(isinstance(value, str) for value in reference.values())):
        raise StudyError('invalid_activity_evidence')
    source = store.get_resource_revision(principal, reference['resourceId'], reference['revisionId'])
    if source['editionId'] != edition_id or source['kind'] != 'lesson-passage' or source['visibility'] != 'group':
        raise StudyError('invalid_lesson_passage')
    try:
        value = json.loads(source['text'])
        if (set(value) != {'schema', 'descriptor', 'transcript'}
                or value['schema'] != 'ardesia.lesson-passage-source.v1'
                or not isinstance(value['transcript'], str) or not 1 <= len(value['transcript'].strip()) <= 8000):
            raise StudyError('invalid_lesson_passage')
        validate_lesson_passage(value['descriptor'])
    except (TypeError, ValueError, KeyError):
        raise StudyError('invalid_lesson_passage') from None
    return source


def freeze_activity_evidence(store, principal, edition_id, activity_id, parameters, evidence, source_refs):
    invalid = StudyError('invalid_activity_evidence')
    required = {'schemaVersion', 'experienceId', 'stepId', 'prediction', 'supportUsed'}
    if (not isinstance(evidence, dict) or not required <= set(evidence)
            or set(evidence) - required - {'lessonPassageRef'} or type(evidence['schemaVersion']) is not int
            or evidence['schemaVersion'] != 1):
        raise invalid
    experience = next((item for item in list_experiences(store, principal, edition_id)['experiences']
                       if item['id'] == evidence['experienceId']), None)
    step = next((item for item in experience['steps'] if item['id'] == evidence['stepId']), None) if experience else None
    if not step or step['activityId'] != activity_id or canonical(parameters) != canonical(step['parameters']):
        raise invalid
    prediction = evidence['prediction']
    if (not isinstance(prediction, dict) or set(prediction) != {'ratio', 'fixedQuantity'}
            or type(prediction['ratio']) not in (int, float) or not math.isfinite(prediction['ratio'])
            or prediction['ratio'] <= 0 or prediction['fixedQuantity'] not in ('pressure', 'flow')):
        raise invalid
    support = evidence['supportUsed']
    if (not isinstance(support, list) or len(support) > 3 or any(not isinstance(item, str) or item not in
            ('constraint-hint', 'lesson-passage', 'model-result') for item in support) or len(set(support)) != len(support)):
        raise invalid
    reference = evidence.get('lessonPassageRef')
    if reference is not None:
        lesson_passage_resource(store, principal, edition_id, reference)
        if not any(ref['resourceId'] == reference['resourceId'] and ref['revisionId'] == reference['revisionId'] for ref in source_refs):
            raise invalid
    if 'lesson-passage' in support and reference is None:
        raise invalid
    # The client can report requested help but cannot erase an earlier result
    # made available by this service by reopening the UI or choosing a new key.
    result = evaluate_activity(activity_id, parameters)
    def normalized(value):
        return [float(value.get(key, 1)) for key in ('radiusRatio', 'viscosity', 'length')] + [value.get('boundary', 'pressure')]
    model_parameters = normalized(parameters)
    store.lock_aggregate(store.connection, 'learning.model-result', canonical([
        principal.id, edition_id, activity_id, result['version'], model_parameters]))
    previous = store.connection.execute('''SELECT r.body FROM study_receipts r
        JOIN study_submissions s ON s.receipt_id=r.id
        WHERE s.student_id=? AND s.edition_id=? AND r.operation='submission.received' ''',
        (principal.id, edition_id)).fetchall()
    def available(row):
        prior = json.loads(row['body'])
        prior_evidence = prior.get('activityEvidence', {})
        if not prior_evidence.get('result'):
            return False
        context = prior.get('courseContext', {})
        return ((prior_evidence.get('experienceId') == evidence['experienceId'] and prior_evidence.get('stepId') == evidence['stepId'])
                or (context.get('modelId') == activity_id and context.get('modelVersion') == result['version']
                    and isinstance(context.get('parameters'), dict)
                    and normalized(context['parameters']) == model_parameters))
    result_available = any(available(row) for row in previous)
    support = list(support)
    if result_available and 'model-result' not in support:
        support.append('model-result')
    return {**evidence, 'supportUsed': support, 'exerciseRef': step.get('exerciseRef'),
            'assistance': 'SUPPORT_REQUESTED' if support else 'NO_SUPPORT_REQUESTED',
            'assistanceScope': 'Aiuti richiesti dichiarati dal client e risultati precedenti disponibili nel servizio; aiuti esterni non osservati.',
            'result': result, 'check': {
                'ratioMatches': math.isclose(prediction['ratio'], result['ratio'], rel_tol=1e-6, abs_tol=1e-9),
                'constraintMatches': prediction['fixedQuantity'] == result['fixedQuantity']}}
