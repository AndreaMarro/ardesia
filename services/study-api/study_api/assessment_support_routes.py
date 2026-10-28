"""Thin authenticated adapter for the existing Core assessment support command."""
from fastapi import Depends, Request
from lessonos.study.assessment_support import request_support
from lessonos.study.models import StudyError


def install_assessment_support_routes(app, store_dependency, authenticate):
    @app.post('/study/editions/{edition_id}/course-assessments/{assessment_id}/support')
    def support(edition_id: str, assessment_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        principal=authenticate(request,store)
        if set(body) != {'courseLesson','level'}:
            raise StudyError('invalid_course_assessment_support')
        return request_support(store,principal,edition_id,assessment_id,body['courseLesson'],body['level'],
                               request.headers.get('Idempotency-Key',''))
