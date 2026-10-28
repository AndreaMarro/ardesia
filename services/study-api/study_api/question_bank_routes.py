"""Authenticated practice and a default-deny scientific/editorial review gate.

Normal students see only questions with a persisted approval matching the
exact revision and digest. A trusted synthetic runtime additionally serves only
the canonical curated references with explicit DRAFT/reference metadata. The owning teacher of the edition gets a
private preview with the full authored record and an append-only audit trail.
No endpoint here publishes an approval for the bundled 4.000 records by itself.
"""
from typing import Literal

from fastapi import Depends, Query, Request
from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictStr

from lessonos.study.models import StudyError
from lessonos.study.question_bank import bank_access_for_edition, bank_catalog_for_edition
from lessonos.study.question_bank_approvals import ApprovalGate


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


class ApprovalBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    questionId: StrictStr = Field(min_length=1, max_length=128)
    questionVersion: int = Field(ge=1, le=1_000_000)
    contentSha256: StrictStr = Field(pattern=r'^[0-9a-f]{64}$')
    decision: Literal['APPROVED', 'REJECTED']
    motivation: StrictStr = Field(min_length=1, max_length=2000)
    confirmPublication: StrictBool = False


class ScientificReviewBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    questionId: StrictStr = Field(min_length=1, max_length=128)
    questionVersion: int = Field(ge=1, le=1_000_000)
    contentSha256: StrictStr = Field(pattern=r'^[0-9a-f]{64}$')
    status: Literal['PENDING', 'APPROVED', 'REJECTED']
    notes: StrictStr = Field(min_length=1, max_length=2000)
    expectedReviewId: StrictStr | None = Field(max_length=128)


class PublicationBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    confirmPublication: StrictBool


class RevocationBody(BaseModel):
    model_config = ConfigDict(extra='forbid')
    reason: StrictStr = Field(min_length=1, max_length=2000)


def _published(payload):
    """Overlay the edition decision: a served record is published, not DRAFT."""
    for item in payload.get('items') or payload.get('questions') or ():
        item['status'] = 'PUBLISHED'
    if 'question' in payload:
        payload['question']['status'] = 'PUBLISHED'
    if 'scientificApproval' in payload:
        payload['scientificApproval'] = 'APPROVED'
        payload['editorialStatus'] = 'PUBLISHED'
    return payload


def install_question_bank_routes(app, store_dependency, authenticate):
    prefix = '/study/editions/{edition_id}/question-banks'

    def gated(store, principal, edition_id, bank_id):
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        from lessonos.study.curated_bank import access
        controlled = access(store, principal, edition_id, bank_id)
        return bank, (None if controlled else ApprovalGate(store, bank, edition_id)), controlled

    def projection(payload, controlled):
        if controlled is not None:
            from lessonos.study.curated_bank import project
            return project(payload)
        return _published(payload)

    @app.get(prefix)
    def catalog(edition_id: str, request: Request, store=Depends(store_dependency)):
        return bank_catalog_for_edition(store, authenticate(request, store), edition_id)

    @app.get(prefix + '/{bank_id}')
    def bank_detail(edition_id: str, bank_id: str, request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        from lessonos.study.curated_bank import access, project
        controlled = access(store, principal, edition_id, bank_id)
        if controlled is not None:
            return project(bank.catalog(published_ids=controlled['ids']))
        if principal.role == 'teacher':
            return bank.catalog()
        return bank.catalog(published_ids=ApprovalGate(store, bank, edition_id).servable_ids())

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
        principal = authenticate(request, store)
        bank, gate, controlled = gated(store, principal, edition_id, bank_id)
        allowed = controlled['ids'] if controlled is not None else gate.servable_ids()
        return projection(bank.questions(
            unit_id=unitId, difficulty=difficulty, format=format, query=q,
            mini_course_id=miniCourseId, limit=limit, after=after,
            expected_sha256=bankSha256, published_ids=allowed), controlled)

    @app.get(prefix + '/{bank_id}/questions/{question_id}')
    def question(edition_id: str, bank_id: str, question_id: str, request: Request,
                 store=Depends(store_dependency)):
        principal = authenticate(request, store)
        bank, gate, controlled = gated(store, principal, edition_id, bank_id)
        allowed = controlled['ids'] if controlled is not None else gate.servable_ids()
        if question_id not in allowed:
            # Uniform 404: an unpublished id is indistinguishable from a missing one.
            raise StudyError('question_not_found', 404)
        return projection({'bankSha256': bank.sha256, 'question': bank.question(question_id)}, controlled)

    @app.post(prefix + '/{bank_id}/exams')
    def exam(edition_id: str, bank_id: str, body: ExamBody, request: Request,
             store=Depends(store_dependency)):
        principal = authenticate(request, store)
        bank, gate, controlled = gated(store, principal, edition_id, bank_id)
        allowed = controlled['ids'] if controlled is not None else gate.servable_ids()
        return projection(bank.exam(
            body.seed, profile_id=body.profileId, difficulty=body.difficulty,
            expected_sha256=body.bankSha256, published_ids=allowed), controlled)

    @app.post(prefix + '/{bank_id}/attempts')
    def attempt(edition_id: str, bank_id: str, body: AttemptBody, request: Request,
                store=Depends(store_dependency)):
        principal = authenticate(request, store)
        bank, gate, controlled = gated(store, principal, edition_id, bank_id)
        allowed = controlled['ids'] if controlled is not None else gate.servable_ids()
        if body.questionId not in allowed:
            raise StudyError('question_not_found', 404)
        return projection(bank.attempt(
            body.questionId, body.response, profile_id=body.profileId,
            expected_sha256=body.bankSha256), controlled)

    @app.get(prefix + '/{bank_id}/review/questions')
    def review_questions(edition_id: str, bank_id: str, request: Request,
                         unitId: str | None = Query(None, max_length=2),
                         difficulty: str | None = Query(None, max_length=16),
                         format: str | None = Query(None, max_length=32),
                         q: str | None = Query(None, max_length=120),
                         miniCourseId: str | None = Query(None, max_length=128),
                         limit: int = Query(20, ge=1, le=100),
                         after: str | None = Query(None, min_length=1, max_length=128),
                         pending: bool = Query(True),
                         store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id, teacher_only=True)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).pending_questions(
            unit_id=unitId, difficulty=difficulty, format=format, query=q,
            mini_course_id=miniCourseId, limit=limit, after=after, pending=pending)

    @app.get(prefix + '/{bank_id}/review/questions/{question_id}')
    def review_question(edition_id: str, bank_id: str, question_id: str, request: Request,
                        store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id, teacher_only=True)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        gate = ApprovalGate(store, bank, edition_id)
        return {'bankSha256': bank.sha256,
                'contentSha256': bank.approval_content_sha256(question_id),
                'questionVersion': bank.question_version(question_id),
                'state': gate.review_state(question_id),
                'question': bank.review_record(question_id)}

    @app.post(prefix + '/{bank_id}/review/approvals')
    def decide(edition_id: str, bank_id: str, body: ApprovalBody, request: Request,
               store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id, teacher_only=True)
        if body.decision == 'APPROVED' and not body.confirmPublication:
            raise StudyError('publication_confirmation_required', 409)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        gate = ApprovalGate(store, bank, edition_id)
        if body.decision == 'APPROVED':
            # Publication requires an explicit, recorded, current scientific review.
            # The compatibility route cannot carry a review ID; confirmation alone
            # must never create or revive a PUBLISHED record.
            gate._validate_binding(
                body.questionId, body.questionVersion, body.contentSha256)
            raise StudyError('publication_requires_scientific_review', 409)
        return gate.approve(
            principal, question_id=body.questionId, question_version=body.questionVersion,
            content_sha256=body.contentSha256, decision=body.decision,
            motivation=body.motivation)

    @app.post(prefix + '/{bank_id}/review/reviews')
    def save_review(edition_id: str, bank_id: str, body: ScientificReviewBody,
                    request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id, teacher_only=True)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).save_review(
            principal, question_id=body.questionId, question_version=body.questionVersion,
            content_sha256=body.contentSha256, status=body.status, notes=body.notes,
            expected_review_id=body.expectedReviewId)

    @app.post(prefix + '/{bank_id}/review/reviews/{review_id}/publish')
    def publish_review(edition_id: str, bank_id: str, review_id: str, body: PublicationBody,
                       request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        store._edition_access(principal, edition_id, teacher_only=True)
        if not body.confirmPublication:
            raise StudyError('publication_confirmation_required', 409)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).publish_review(principal, review_id)

    @app.post(prefix + '/{bank_id}/review/approvals/{approval_id}/revoke')
    def revoke(edition_id: str, bank_id: str, approval_id: str, body: RevocationBody,
               request: Request, store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).revoke(
            principal, approval_id, reason=body.reason)

    @app.get(prefix + '/{bank_id}/review/approvals/{approval_id}/events')
    def approval_events(edition_id: str, bank_id: str, approval_id: str, request: Request,
                        store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).approval_events(principal, approval_id)

    @app.get(prefix + '/{bank_id}/review/questions/{question_id}/history')
    def history(edition_id: str, bank_id: str, question_id: str, request: Request,
                store=Depends(store_dependency)):
        principal = authenticate(request, store)
        _, bank = bank_access_for_edition(store, principal, edition_id, bank_id)
        return ApprovalGate(store, bank, edition_id).history(principal, question_id)
