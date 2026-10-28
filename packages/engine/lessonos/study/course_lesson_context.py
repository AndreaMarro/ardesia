"""Validate editorial provenance without creating another attempt authority."""
import re
from typing import Literal, NotRequired, TypedDict

from .models import StudyError


class LessonReference(TypedDict):
    id: str
    version: int
    sha256: str


class CourseLessonContext(TypedDict):
    lessonRef: LessonReference
    phase: Literal['practice', 'transfer']
    stepId: NotRequired[str]
    assessmentRef: NotRequired[LessonReference]
    assessmentPrompt: NotRequired[str]
    assessmentCollection: NotRequired[Literal['atomicFinalAssessment','diagnostic']]
    assessmentObjectiveId: NotRequired[str]


def resolve_assessment(pack, reference):
    """Resolve one unambiguous authored atomic or diagnostic revision."""
    from .store import canonical, digest
    matches = [(collection,item) for collection in ('atomicFinalAssessment','diagnostic')
               for item in pack.get(collection,[]) if item['id'] == reference['id']]
    if len(matches) != 1:
        raise StudyError('stale_course_assessment',409)
    collection,item = matches[0]
    if reference != {'id':item['id'],'version':1,'sha256':digest(canonical(item))}:
        raise StudyError('stale_course_assessment',409)
    return collection,item


def freeze_course_lesson(store, principal, edition_id, activity_id, value, parameters) -> CourseLessonContext | None:
    if value is None:
        return None  # Existing commands/receipts keep their original meaning.
    if (not isinstance(value, dict) or not {'lessonRef', 'phase'} <= set(value)
            or set(value) - {'lessonRef', 'phase', 'stepId', 'assessmentRef'}
            or value['phase'] not in ('practice', 'transfer')):
        raise StudyError('invalid_course_lesson')
    if 'stepId' in value and (not isinstance(value['stepId'], str)
                              or not re.fullmatch(r'[a-zA-Z0-9_-]{1,128}', value['stepId'])):
        raise StudyError('invalid_course_lesson')
    ref = value['lessonRef']
    if (not isinstance(ref, dict) or set(ref) != {'id', 'version', 'sha256'}
            or not isinstance(ref['id'], str) or not 1 <= len(ref['id']) <= 128
            or type(ref['version']) is not int or ref['version'] < 1
            or not isinstance(ref['sha256'], str) or len(ref['sha256']) != 64
            or any(char not in '0123456789abcdef' for char in ref['sha256'])):
        raise StudyError('invalid_course_lesson')
    # This is the same authorized projection used by the reader: membership
    # never makes unpublished editorial answers assignable to a student.
    from .four_courses import coursepack_for_edition, lesson_reference
    pack = coursepack_for_edition(store, principal, edition_id)
    lesson = next((item for item in pack['lessons'] if item['id'] == ref['id']), None)
    if lesson is None:
        raise StudyError('course_lesson_unavailable', 409)
    expected = lesson.get('lessonRef') or lesson_reference(lesson)
    if 'stepId' in value and value['stepId'] not in {step['id'] for step in lesson.get('learningSequence', [])}:
        raise StudyError('invalid_course_lesson')
    if ref != expected:
        raise StudyError('stale_course_lesson', 409)
    assessment_context = {}
    if 'assessmentRef' in value:
        if activity_id != 'course-reasoning-v1':
            raise StudyError('course_assessment_activity_mismatch', 409)
        assessment_ref = value['assessmentRef']
        if (not isinstance(assessment_ref, dict) or set(assessment_ref) != {'id', 'version', 'sha256'}
                or not isinstance(assessment_ref['id'], str) or not re.fullmatch(r'[a-zA-Z0-9_.-]{1,128}', assessment_ref['id'])
                or type(assessment_ref['version']) is not int or assessment_ref['version'] < 1
                or not isinstance(assessment_ref['sha256'], str) or not re.fullmatch(r'[a-f0-9]{64}', assessment_ref['sha256'])):
            raise StudyError('invalid_course_assessment')
        from .catalog import edition_pack, load_pack
        binding = edition_pack(store, edition_id)
        canonical_pack = load_pack(binding['packId'], binding['packVersion'])
        collection,item = resolve_assessment(canonical_pack,assessment_ref)
        if collection == 'diagnostic':
            if value['phase'] != 'practice':
                raise StudyError('course_assessment_phase_unavailable',409)
            target = item.get('recoveryTarget',{})
            if target.get('lessonId') != lesson['id'] or target.get('objectiveId') != item['objectiveId']:
                raise StudyError('course_assessment_objective_mismatch',409)
        if item['objectiveId'] not in lesson['objectiveIds'] or item['courseId'] != binding['courseId']:
            raise StudyError('course_assessment_objective_mismatch', 409)
        prompt = item.get('prompt') if value['phase'] == 'practice' else item.get('transfer', {}).get('prompt')
        if not isinstance(prompt, str) or not prompt.strip():
            raise StudyError('course_assessment_phase_unavailable', 409)
        assessment_context = {'assessmentRef':dict(assessment_ref), 'assessmentPrompt':prompt,
                              'assessmentCollection':collection,'assessmentObjectiveId':item['objectiveId']}
    from .science_library.fluid_catalog import FLUID_LAB_DEFINITIONS
    lab = FLUID_LAB_DEFINITIONS.get(activity_id)
    if lab is not None and not any(
            objective == family or objective.startswith(family+'.')
            for objective in lesson['objectiveIds'] for family in lab['objectiveIds']):
        raise StudyError('course_lab_mismatch', 409)
    if (activity_id == 'course-reasoning-v1' and not lesson.get('activityId')):
        lesson = {**lesson, 'activityId': activity_id}
    if (lab is None and lesson.get('activityId') != activity_id) or value['phase'] not in lesson:
        raise StudyError('course_lesson_activity_mismatch', 409)
    # Legacy typed transfers retain their declared parameters. Plugin evidence
    # validates controls independently in the Core solver; its canonical lesson
    # and phase identify the context without grading it.
    if activity_id == 'course-reasoning-v1' and parameters != {}:
        raise StudyError('course_lesson_parameters_mismatch', 409)
    if lab is None and activity_id != 'course-reasoning-v1' and value['phase'] == 'transfer' and parameters != lesson['transfer'].get('parameters'):
        raise StudyError('course_lesson_parameters_mismatch', 409)
    return {'lessonRef': expected, 'phase': value['phase'],
            **({'stepId':value['stepId']} if 'stepId' in value else {}), **assessment_context}


def require_same_parent_lesson(parent_context, current_context):
    """An attempt revision corrects the same lesson/phase/assessment, including legacy."""
    parent = {key: parent_context.get(key) for key in ('lessonRef', 'phase', 'assessmentRef')}
    current = {key: current_context.get(key) for key in ('lessonRef', 'phase', 'assessmentRef')}
    if parent != current:
        raise StudyError('parent_course_lesson_mismatch', 409)
