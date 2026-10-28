"""Strict portable plugin evidence inside the existing science-resource payload."""
import re

from ..models import StudyError
from ..store import canonical, digest
from .fluid_catalog import FLUID_LAB_DEFINITIONS


def invalid():
    raise StudyError('invalid_science_snapshot')


def exact_ref(value):
    if (not isinstance(value, dict) or set(value) != {'id', 'version', 'sha256'}
            or not isinstance(value['id'], str) or not re.fullmatch(r'[a-zA-Z0-9_-]{1,128}', value['id'])
            or type(value['version']) is not int or not 1 <= value['version'] <= 1_000_000
            or not isinstance(value['sha256'], str) or not re.fullmatch('[a-f0-9]{64}', value['sha256'])):
        invalid()


def validate_course_shape(value):
    if (not isinstance(value, dict) or not {'lessonRef', 'phase'} <= set(value)
            or set(value) - {'lessonRef', 'phase', 'stepId'}
            or value['phase'] not in ('practice', 'transfer')):
        invalid()
    exact_ref(value['lessonRef'])
    if 'stepId' in value and (not isinstance(value['stepId'], str)
                              or not re.fullmatch(r'[a-zA-Z0-9_-]{1,128}', value['stepId'])):
        invalid()


def validate(snapshot):
    """Shape/binding only: reopening historical evidence never executes a model."""
    if 'courseLesson' in snapshot:
        validate_course_shape(snapshot['courseLesson'])
    if 'labSnapshot' not in snapshot:
        return
    lab = snapshot['labSnapshot']
    if (not isinstance(lab, dict) or set(lab) != {'schema', 'pluginId', 'pluginVersion', 'configuration', 'prediction', 'note', 'supportUsed', 'view'}
            or lab['schema'] != 'ardesia.fluid-thermo.snapshot/1'
            or lab['pluginId'] != 'io.ardesia.fluid-thermo'
            or not isinstance(lab['pluginVersion'], str) or not re.fullmatch(r'[0-9]{1,6}\.[0-9]{1,6}\.[0-9]{1,6}', lab['pluginVersion'])
            or lab['view'] not in ('2d', '3d')):
        invalid()
    config = lab['configuration']
    if (not isinstance(config, dict) or not {'schemaVersion', 'modelId', 'modelVersion', 'parameters'} <= set(config)
            or set(config) - {'schemaVersion', 'modelId', 'modelVersion', 'parameters', 'lessonRef', 'exerciseRef', 'sourceRefs'}
            or type(config['schemaVersion']) is not int or config['schemaVersion'] != 1
            or type(config['modelVersion']) is not int or config['modelVersion'] != snapshot['capabilityVersion']):
        invalid()
    definition = FLUID_LAB_DEFINITIONS.get(snapshot['capabilityId'])
    if (definition is None or config['modelId'] != definition['id']
            or type(config['parameters']) is not dict or canonical(config['parameters']) != canonical(snapshot['parameters'])
            or lab['prediction'] != snapshot['prediction'] or lab['note'] != snapshot['note']
            or lab['supportUsed'] != snapshot.get('supportUsed', [])):
        invalid()
    if (not isinstance(lab['supportUsed'], list) or len(lab['supportUsed']) > 2
            or any(not isinstance(v, str) or v not in ('model', 'hint') for v in lab['supportUsed'])
            or len(set(lab['supportUsed'])) != len(lab['supportUsed'])):
        invalid()
    for field in ('lessonRef', 'exerciseRef'):
        if field in config:
            exact_ref(config[field])
    if 'lessonRef' in config and 'courseLesson' in snapshot and config['lessonRef'] != snapshot['courseLesson']['lessonRef']:
        invalid()
    refs = config.get('sourceRefs', [])
    if (not isinstance(refs, list) or len(refs) > 5
            or any(not isinstance(ref, dict) or set(ref) != {'resourceId', 'revisionId'}
                   or any(not isinstance(v, str) or not 1 <= len(v) <= 128 or '\x00' in v for v in ref.values()) for ref in refs)
            or len({canonical(r) for r in refs}) != len(refs)):
        invalid()


def authorize(store, principal, edition_id, snapshot):
    """Resolve optional refs using existing pinned packs and source authorization."""
    config = snapshot.get('labSnapshot', {}).get('configuration', {})
    course = snapshot.get('courseLesson')
    lesson_ref = config.get('lessonRef') or (course or {}).get('lessonRef')
    if lesson_ref is not None or 'exerciseRef' in config:
        from ..four_courses import coursepack_for_edition, lesson_reference
        pack = coursepack_for_edition(store, principal, edition_id)
        if lesson_ref is not None:
            lesson = next((l for l in pack['lessons'] if l['id'] == lesson_ref['id']), None)
            if lesson is None:
                raise StudyError('course_lesson_unavailable', 409)
            if lesson_ref != (lesson.get('lessonRef') or lesson_reference(lesson)):
                raise StudyError('stale_course_lesson', 409)
            definition = FLUID_LAB_DEFINITIONS.get(snapshot['capabilityId'])
            if definition is not None and not any(
                    objective == family or objective.startswith(family+'.')
                    for objective in lesson['objectiveIds'] for family in definition['objectiveIds']):
                raise StudyError('course_lab_mismatch', 409)
            if course and (course['phase'] not in lesson or ('stepId' in course and
                    course['stepId'] not in {step['id'] for step in lesson.get('learningSequence', [])})):
                raise StudyError('invalid_course_lesson')
        if 'exerciseRef' in config:
            # Exercises are canonical pinned pack items, not browser result IDs.
            # The full pack is used only after the authorized lesson projection.
            from ..catalog import edition_pack, load_pack
            binding = edition_pack(store, edition_id)
            full = load_pack(binding['packId'], binding['packVersion'])
            exercises = full['exercises'] + [i for g in full['transferTests'] for i in g['items']]
            ref = config['exerciseRef']
            exercise = next((e for e in exercises if e['id'] == ref['id']), None)
            if exercise is None or ref != {'id':exercise['id'], 'version':1, 'sha256':digest(canonical(exercise))}:
                raise StudyError('stale_course_exercise', 409)
            if (lesson_ref is not None and ref['id'] not in {lesson_ref['id']+'-'+phase for phase in
                    ((course['phase'],) if course else ('practice', 'transfer'))}):
                raise StudyError('course_exercise_mismatch', 409)
    for ref in config.get('sourceRefs', []):
        source = store.get_resource_revision(principal, ref['resourceId'], ref['revisionId'])
        if source['editionId'] != edition_id:
            raise StudyError('invalid_source_refs')
