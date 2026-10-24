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
from .store import canonical, digest


def list_experiences(store, principal, edition_id, *, format='legacy'):
    store._edition_access(principal, edition_id)
    if format not in ('legacy', 'composable'):
        raise StudyError('invalid_experience_format')
    binding = edition_pack(store, edition_id)
    pack = load_pack(binding['packId'], binding['packVersion'])
    if format == 'composable':
        return _list_composable(binding, pack)
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


_PHASES = ('situation', 'prediction', 'model', 'visual', 'explanation', 'source', 'transfer')
_MODEL_FIELDS = {
    'poiseuille-v1': {'radiusRatio': 1, 'viscosity': 1, 'length': 1, 'boundary': 'pressure'},
    'hydrostatic-v1': {'density': 1000, 'depth': 1, 'g': 9.81,
                       'surfacePressure': 101325, 'reference': 'gauge'},
}


def _normalized_model_parameters(activity_id, parameters):
    """Identity uses evaluator defaults, including the pressure reference.

    This is an identity projection, never a second numerical solver. Unknown
    fields from historical receipts cannot reset an already available answer.
    """
    defaults = _MODEL_FIELDS[activity_id]
    evaluate_activity(activity_id, parameters)
    return {key: float(parameters.get(key, default)) if type(default) in (int, float)
            else parameters.get(key, default) for key, default in defaults.items()}


def _list_composable(binding, pack):
    pack_ref = {key: binding[key] for key in ('packId', 'packVersion', 'packSha256')}
    manifests = json.loads((Path(__file__).parent / 'content' / 'learning-compositions-v1.json').read_text())
    resolved = []
    seen = set()
    activities = {item['id']: item for item in pack['activities']}
    exercises = {item['id']: item for item in pack['exercises'] +
                 [item for group in pack['transferTests'] for item in group['items']]}
    for manifest in manifests['experiences']:
        invalid = StudyError('invalid_experience_composition')
        manifest_keys = {'compositionVersion', 'id', 'version', 'title', 'objective', 'steps', 'packId', 'packVersion'}
        if (not isinstance(manifest, dict) or set(manifest) != manifest_keys
                or any(not isinstance(manifest[key], str) or not 1 <= len(manifest[key].strip()) <= 4000
                       for key in ('id', 'title', 'objective', 'packId'))
                or type(manifest['packVersion']) is not int):
            raise invalid
        if (manifest['packId'], manifest['packVersion']) != (binding['packId'], binding['packVersion']):
            continue
        if (type(manifest.get('compositionVersion')) is not int or manifest['compositionVersion'] != 1
                or type(manifest.get('version')) is not int
                or manifest['version'] < 1 or manifest['id'] in seen
                or not isinstance(manifest.get('steps'), list) or not 1 <= len(manifest['steps']) <= 20):
            raise invalid
        seen.add(manifest['id'])
        step_ids = set()
        for step in manifest['steps']:
            required = {'id', 'title', 'prompt', 'activityId', 'activityVersion', 'parameters',
                        'prediction', 'phases', 'hints', 'advanceWhen'}
            if not isinstance(step, dict) or not required <= set(step) or set(step) - required - {'exerciseRef'}:
                raise invalid
            activity_id = step.get('activityId')
            parameters = step.get('parameters')
            phases = step.get('phases')
            if (not isinstance(step.get('id'), str) or not step['id'] or step['id'] in step_ids
                    or not isinstance(activity_id, str) or activity_id not in _MODEL_FIELDS or activity_id not in activities
                    or not isinstance(parameters, dict) or set(parameters) - set(_MODEL_FIELDS[activity_id])
                    or not isinstance(phases, list) or any(item not in _PHASES for item in phases)
                    or len(set(phases)) != len(phases) or not set(_PHASES[:-1]) <= set(phases)
                    or phases.index('prediction') > min(phases.index(item) for item in ('model', 'visual', 'explanation'))
                    or step.get('advanceWhen') != 'receipt-confirmed'
                    or not isinstance(step.get('hints'), list) or not 1 <= len(step['hints']) <= 3
                    or any(not isinstance(hint, str) or not 1 <= len(hint.strip()) <= 1000 for hint in step['hints'])
                    or any(not isinstance(step.get(key), str) or not 1 <= len(step[key].strip()) <= 4000
                           for key in ('title', 'prompt'))):
                raise invalid
            step_ids.add(step['id'])
            if 'exerciseRef' in step:
                source = exercises.get(step['exerciseRef']) if isinstance(step['exerciseRef'], str) else None
                if (not source or source['activityId'] != activity_id
                        or canonical(source['parameters']) != canonical(parameters)):
                    raise invalid
            result = evaluate_activity(activity_id, parameters)
            expected_prediction = ({'kind': 'ratio', 'fixedQuantityRequired': True} if activity_id == 'poiseuille-v1'
                                   else {'kind': 'scalar', 'unit': result['unit']})
            if (type(step.get('activityVersion')) is not int or step['activityVersion'] != result['version']
                    or activities[activity_id].get('version', 1) != result['version']
                    or step.get('prediction') != expected_prediction):
                raise invalid
        experience = {key: manifest[key] for key in ('compositionVersion', 'id', 'version', 'title', 'objective', 'steps')}
        experience.update(coursePackRef=pack_ref, editorialStatus='DRAFT', scientificApproval='NOT_ATTESTED')
        experience['experienceRef'] = {'id': experience['id'], 'version': experience['version'],
                                       'sha256': digest(canonical(experience))}
        resolved.append(experience)
    return {'schemaVersion': 2, 'coursePackRef': pack_ref, 'experiences': resolved}


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


def _finite_prediction_number(value):
    if type(value) not in (int, float):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        # JSON integers have arbitrary precision; the numeric comparison does
        # not. Treat an unrepresentable prediction as invalid input, not a 500.
        return False


def freeze_activity_evidence(store, principal, edition_id, activity_id, parameters, evidence, source_refs):
    if isinstance(evidence, dict) and type(evidence.get('schemaVersion')) is int and evidence['schemaVersion'] == 2:
        return _freeze_composable_evidence(store, principal, edition_id, activity_id, parameters, evidence, source_refs)
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
            or not _finite_prediction_number(prediction['ratio'])
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


def _freeze_composable_evidence(store, principal, edition_id, activity_id, parameters, evidence, source_refs):
    invalid = StudyError('invalid_activity_evidence')
    required = {'schemaVersion', 'experienceRef', 'stepId', 'prediction', 'supportUsed'}
    if not required <= set(evidence) or set(evidence) - required - {'lessonPassageRef'}:
        raise invalid
    reference = evidence['experienceRef']
    if (not isinstance(reference, dict) or set(reference) != {'id', 'version', 'sha256'}
            or not isinstance(reference['id'], str) or type(reference['version']) is not int
            or not isinstance(reference['sha256'], str)):
        raise invalid
    experience = next((item for item in list_experiences(store, principal, edition_id, format='composable')['experiences']
                       if item['experienceRef'] == reference), None)
    step = next((item for item in experience['steps'] if item['id'] == evidence['stepId']), None) if experience else None
    if not step or step['activityId'] != activity_id or canonical(parameters) != canonical(step['parameters']):
        raise invalid
    prediction = evidence['prediction']
    kind = step['prediction']['kind']
    if kind == 'scalar':
        if (not isinstance(prediction, dict) or set(prediction) != {'kind', 'value', 'unit'}
                or prediction['kind'] != 'scalar' or not _finite_prediction_number(prediction['value'])
                or not isinstance(prediction['unit'], str)
                or not 1 <= len(prediction['unit'].strip()) <= 32):
            raise invalid
    elif (not isinstance(prediction, dict) or set(prediction) != {'kind', 'ratio', 'fixedQuantity'}
          or prediction['kind'] != 'ratio' or not _finite_prediction_number(prediction['ratio'])
          or prediction['ratio'] <= 0
          or prediction['fixedQuantity'] not in ('pressure', 'flow')):
        raise invalid
    support = evidence['supportUsed']
    if (not isinstance(support, list) or len(support) > 3 or any(not isinstance(item, str) or item not in
            ('constraint-hint', 'lesson-passage', 'model-result') for item in support) or len(set(support)) != len(support)):
        raise invalid
    lesson_ref = evidence.get('lessonPassageRef')
    if lesson_ref is not None:
        lesson_passage_resource(store, principal, edition_id, lesson_ref)
        if not any(ref['resourceId'] == lesson_ref['resourceId'] and ref['revisionId'] == lesson_ref['revisionId'] for ref in source_refs):
            raise invalid
    if 'lesson-passage' in support and lesson_ref is None:
        raise invalid
    result = evaluate_activity(activity_id, parameters)
    model_parameters = _normalized_model_parameters(activity_id, parameters)
    # Same aggregate as historical ratios, with the scalar reference included.
    # No editorial version or fresh request key can reset available assistance.
    lock_parameters = (list(model_parameters.values()) if activity_id == 'poiseuille-v1' else model_parameters)
    store.lock_aggregate(store.connection, 'learning.model-result', canonical([
        principal.id, edition_id, activity_id, result['version'], lock_parameters]))
    previous = store.connection.execute('''SELECT r.body FROM study_receipts r
        JOIN study_submissions s ON s.receipt_id=r.id
        WHERE s.student_id=? AND s.edition_id=? AND r.operation='submission.received' ''',
        (principal.id, edition_id)).fetchall()
    def available(row):
        prior = json.loads(row['body'])
        context = prior.get('courseContext', {})
        if (not prior.get('activityEvidence', {}).get('result') or context.get('modelId') != activity_id
                or context.get('modelVersion') != result['version'] or not isinstance(context.get('parameters'), dict)):
            return False
        try:
            return _normalized_model_parameters(activity_id, context['parameters']) == model_parameters
        except StudyError:
            return False
    support = list(support)
    if any(available(row) for row in previous) and 'model-result' not in support:
        support.append('model-result')
    check = ({'kind': 'scalar', 'valueMatches': math.isclose(prediction['value'], result['value'], rel_tol=1e-6, abs_tol=1e-9),
              'unitMatches': prediction['unit'] == result['unit']} if kind == 'scalar' else
             {'kind': 'ratio', 'ratioMatches': math.isclose(prediction['ratio'], result['ratio'], rel_tol=1e-6, abs_tol=1e-9),
              'constraintMatches': prediction['fixedQuantity'] == result['fixedQuantity']})
    return {**evidence, 'exerciseRef': step.get('exerciseRef'), 'supportUsed': support,
            'assistance': 'SUPPORT_REQUESTED' if support else 'NO_SUPPORT_REQUESTED',
            'assistanceScope': 'Aiuti richiesti dichiarati dal client e risultati precedenti disponibili nel servizio; aiuti esterni non osservati.',
            'result': {'kind': kind, **result}, 'check': check}
