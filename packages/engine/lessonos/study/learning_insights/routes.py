"""Optional API installer. Caller supplies canonical auth/store dependencies."""
import json
from fastapi import Depends, Query, Request
from fastapi.responses import JSONResponse
from ..models import StudyError
from . import dashboard, export, ingest, set_preferences


def install_routes(app, store_dependency, authenticate, *, notice=None):
    prefix = '/study/learning-insights'

    async def bounded_body(request: Request):
        raw = bytearray()
        async for chunk in request.stream():
            raw.extend(chunk)
            if len(raw) > 4096:
                raise StudyError('learning_events_too_large', 413)
        try:
            value = json.loads(raw)
        except (ValueError, UnicodeDecodeError, RecursionError):
            raise StudyError('invalid_learning_request') from None
        if not isinstance(value, dict):
            raise StudyError('invalid_learning_request')
        return value

    def response(value, **kwargs):
        return JSONResponse(value, headers={'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}, **kwargs)

    @app.get(prefix)
    def read(request: Request, editionId: str = Query(min_length=1, max_length=128), store=Depends(store_dependency)):
        return response(dashboard(store, authenticate(request, store), editionId, notice=notice))

    @app.get(prefix + '/export')
    def download(request: Request, editionId: str = Query(min_length=1, max_length=128), store=Depends(store_dependency)):
        result = response(export(store, authenticate(request, store), editionId, notice=notice))
        result.headers['Content-Disposition'] = 'attachment; filename="ardesia-learning-insights.json"'
        return result

    @app.put(prefix + '/preferences')
    def preference(request: Request, body=Depends(bounded_body), store=Depends(store_dependency)):
        principal = authenticate(request, store)
        if set(body) != {'editionId', 'enabled', 'noticeVersion'}:
            raise StudyError('invalid_learning_request')
        return response(set_preferences(store, principal, body['editionId'], body['enabled'], body['noticeVersion'], notice=notice))

    @app.post(prefix + '/events')
    def events(request: Request, body=Depends(bounded_body), store=Depends(store_dependency)):
        principal = authenticate(request, store)
        if set(body) != {'editionId', 'events'}:
            raise StudyError('invalid_learning_request')
        return response(ingest(store, principal, body['editionId'], body['events'], notice=notice))
