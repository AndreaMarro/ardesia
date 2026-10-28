"""Validate editorial provenance without creating another attempt authority."""
from typing import Literal, TypedDict

from .models import StudyError


class LessonReference(TypedDict):
    id: str
    version: int
    sha256: str


class CourseLessonContext(TypedDict):
    lessonRef: LessonReference
    phase: Literal['practice', 'transfer']


def freeze_course_lesson(store, principal, edition_id, activity_id, value, parameters) -> CourseLessonContext | None:
    if value is None:
        return None  # Existing commands/receipts keep their original meaning.
    if (not isinstance(value, dict) or set(value) != {'lessonRef', 'phase'}
            or value['phase'] not in ('practice', 'transfer')):
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
    if ref != expected:
        raise StudyError('stale_course_lesson', 409)
    if (activity_id == 'course-reasoning-v1' and not lesson.get('activityId')):
        lesson = {**lesson, 'activityId': activity_id}
    if lesson.get('activityId') != activity_id or value['phase'] not in lesson:
        raise StudyError('course_lesson_activity_mismatch', 409)
    # Changing model controls is practice. A transfer label identifies the
    # lesson's declared new situation, never arbitrary practice parameters.
    if activity_id == 'course-reasoning-v1' and parameters != {}:
        raise StudyError('course_lesson_parameters_mismatch', 409)
    if activity_id != 'course-reasoning-v1' and value['phase'] == 'transfer' and parameters != lesson['transfer'].get('parameters'):
        raise StudyError('course_lesson_parameters_mismatch', 409)
    return {'lessonRef': expected, 'phase': value['phase']}


def require_same_parent_lesson(parent_context, current_context):
    """An attempt revision corrects the same lesson/phase, including legacy."""
    parent = {key: parent_context.get(key) for key in ('lessonRef', 'phase')}
    current = {key: current_context.get(key) for key in ('lessonRef', 'phase')}
    if parent != current:
        raise StudyError('parent_course_lesson_mismatch', 409)
