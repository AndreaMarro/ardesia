"""Authenticated supplementary practice; no public answers or new authority."""
from typing import Literal

from fastapi import Depends, Query, Request
from pydantic import BaseModel, ConfigDict, Field, StrictStr

from lessonos.study.question_bank import bank_catalog_for_edition, bank_for_edition


class ExamBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    seed: StrictStr = Field(min_length=1, max_length=128)
    profileId: StrictStr = Field(default='semestre-2026', min_length=1, max_length=64)
    difficulty: Literal['base', 'facile', 'medio', 'difficile'] | None = None
    bankSha256: StrictStr | None = Field(default=None, pattern=r'^[0-9a-f]{64}$')


class AttemptBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    questionId: StrictStr = Field(min_length=1, max_length=128)
    response: StrictStr = Field(max_length=128)
    profileId: StrictStr = Field(default='semestre-2026', min_length=1, max_length=64)
    bankSha256: StrictStr | None = Field(default=None, pattern=r'^[0-9a-f]{64}$')


def install_question_bank_routes(app, store_dependency, authenticate):
    prefix = '/study/editions/{edition_id}/question-banks'

    @app.get(prefix)
    def catalog(edition_id: str, request: Request, store=Depends(store_dependency)):
        return bank_catalog_for_edition(store, authenticate(request, store), edition_id)

    @app.get(prefix + '/{bank_id}')
    def bank_detail(edition_id: str, bank_id: str, request: Request, store=Depends(store_dependency)):
        return bank_for_edition(store, authenticate(request, store), edition_id, bank_id).catalog()

    @app.get(prefix + '/{bank_id}/questions')
    def questions(edition_id: str, bank_id: str, request: Request,
                  unitId: str | None = Query(None, max_length=2),
                  difficulty: str | None = Query(None, max_length=16),
                  format: str | None = Query(None, max_length=32),
                  q: str | None = Query(None, max_length=120),
                  miniCourseId: str | None = Query(None, max_length=128),
                  limit: int = Query(20, ge=1, le=100),
                  after: str | None = Query(None, min_length=1, max_length=128),
                  bankSha256: str | None = Query(None, pattern=r'^[0-9a-f]{64}$'),
                  store=Depends(store_dependency)):
        bank = bank_for_edition(store, authenticate(request, store), edition_id, bank_id)
        return bank.questions(unit_id=unitId, difficulty=difficulty, format=format, query=q,
                              mini_course_id=miniCourseId, limit=limit, after=after,
                              expected_sha256=bankSha256)

    @app.get(prefix + '/{bank_id}/questions/{question_id}')
    def question(edition_id: str, bank_id: str, question_id: str, request: Request,
                 store=Depends(store_dependency)):
        bank = bank_for_edition(store, authenticate(request, store), edition_id, bank_id)
        return {'bankSha256': bank.sha256, 'question': bank.question(question_id)}

    @app.post(prefix + '/{bank_id}/exams')
    def exam(edition_id: str, bank_id: str, body: ExamBody, request: Request,
             store=Depends(store_dependency)):
        bank = bank_for_edition(store, authenticate(request, store), edition_id, bank_id)
        return bank.exam(body.seed, profile_id=body.profileId, difficulty=body.difficulty,
                         expected_sha256=body.bankSha256)

    @app.post(prefix + '/{bank_id}/attempts')
    def attempt(edition_id: str, bank_id: str, body: AttemptBody, request: Request,
                store=Depends(store_dependency)):
        bank = bank_for_edition(store, authenticate(request, store), edition_id, bank_id)
        return bank.attempt(body.questionId, body.response, profile_id=body.profileId,
                            expected_sha256=body.bankSha256)
