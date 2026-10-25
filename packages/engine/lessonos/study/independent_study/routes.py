"""Optional HTTP composition; uses the caller's canonical auth/store dependencies."""
from fastapi import Depends, Request
from pydantic import BaseModel, ConfigDict, Field
from . import catalog, start, resume, act, attempt

class StrictBody(BaseModel):
    model_config = ConfigDict(extra='forbid')

class StartBody(StrictBody):
    editionId: str = Field(min_length=1, max_length=128)
    lessonRef: dict

class ActionBody(StrictBody):
    revisionId: str = Field(min_length=1, max_length=128)
    action: str = Field(min_length=1, max_length=32)
    fields: dict = Field(default_factory=dict)

class AttemptBody(StrictBody):
    revisionId: str = Field(min_length=1, max_length=128)
    answer: dict


def install_routes(app, store_dependency, authenticate):
    @app.get('/study/independent-study')
    def list_study(editionId: str, request: Request, store=Depends(store_dependency)):
        return catalog(store, authenticate(request, store), editionId)

    @app.post('/study/independent-study')
    def start_study(body: StartBody, request: Request, store=Depends(store_dependency)):
        return start(store, authenticate(request, store), body.editionId, body.lessonRef,
                     request.headers.get('Idempotency-Key', ''))

    @app.get('/study/independent-study/{resource_id}')
    def resume_study(resource_id: str, request: Request, store=Depends(store_dependency)):
        return resume(store, authenticate(request, store), resource_id)

    @app.post('/study/independent-study/{resource_id}/actions')
    def action_study(resource_id: str, body: ActionBody, request: Request, store=Depends(store_dependency)):
        return act(store, authenticate(request, store), resource_id, body.revisionId,
                   body.action, body.fields, request.headers.get('Idempotency-Key', ''))

    @app.post('/study/independent-study/{resource_id}/attempts')
    def attempt_study(resource_id: str, body: AttemptBody, request: Request, store=Depends(store_dependency)):
        return attempt(store, authenticate(request, store), resource_id, body.revisionId,
                       body.answer, request.headers.get('Idempotency-Key', ''))
