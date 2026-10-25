"""Stateless public preview: proposed course and one bounded Core activity.

This app has no database, authentication, enrollment or interest collection.
Deploy separately from the synthetic/private adapter.
"""
from collections import deque
import json
import math
from pathlib import Path
from time import monotonic

from anyio import fail_after
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from lessonos.study.activities import evaluate_activity
from lessonos.study.models import StudyError
from lessonos.study.public_preview import RADIUS_MAX, RADIUS_MIN, public_course

MAX_BODY_BYTES = 4096
PUBLIC_PREFIX = '/study/public/'


def _reject_constant(value):
    raise ValueError('non_finite_json')


def create_public_app(*, frontend: Path | None = None, request_limit=120, clock=monotonic):
    """The rate limit is per process, shared by all callers; no identity is stored."""
    if type(request_limit) is not int or not 1 <= request_limit <= 10000:
        raise ValueError('invalid_public_request_limit')
    app = FastAPI(title='Ardesia — anteprima pubblica', docs_url=None,
                  redoc_url=None, openapi_url=None)
    requests = deque()

    @app.middleware('http')
    async def public_boundary(request, call_next):
        if request.url.path.startswith(PUBLIC_PREFIX):
            now = clock()
            while requests and requests[0] <= now - 60:
                requests.popleft()
            if len(requests) >= request_limit:
                response = JSONResponse({'error': 'rate_limited'}, status_code=429,
                                        headers={'Retry-After': str(max(1, math.ceil(60 - now + requests[0])))})
            else:
                requests.append(now)
                response = await call_next(request)
        else:
            response = await call_next(request)
        response.headers.update({
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                                       "img-src 'self' data:; connect-src 'self'; object-src 'none'; "
                                       "base-uri 'none'; frame-ancestors 'none'",
        })
        return response

    @app.get('/study/public/course')
    async def course():
        return public_course()

    @app.post('/study/public/activities/evaluate')
    async def evaluate(request: Request):
        if request.headers.get('content-type', '').split(';', 1)[0].strip().lower() != 'application/json':
            return JSONResponse({'error': 'json_required'}, status_code=415)
        data = bytearray()
        try:
            with fail_after(2):
                async for chunk in request.stream():
                    if len(data) + len(chunk) > MAX_BODY_BYTES:
                        return JSONResponse({'error': 'body_too_large'}, status_code=413)
                    data.extend(chunk)
        except TimeoutError:
            return JSONResponse({'error': 'request_timeout'}, status_code=408)
        try:
            body = json.loads(data, parse_constant=_reject_constant)
        except (ValueError, UnicodeError, RecursionError):
            return JSONResponse({'error': 'invalid_request'}, status_code=422)
        if not isinstance(body, dict) or set(body) != {'activityId', 'parameters'}:
            return JSONResponse({'error': 'invalid_request'}, status_code=422)
        if body['activityId'] != 'poiseuille-v1':
            return JSONResponse({'error': 'activity_not_supported'}, status_code=404)
        parameters = body['parameters']
        if not isinstance(parameters, dict) or not set(parameters) <= {'radiusRatio', 'boundary'}:
            return JSONResponse({'error': 'invalid_parameters'}, status_code=422)
        radius = parameters.get('radiusRatio', 1)
        if type(radius) not in (int, float) or not RADIUS_MIN <= radius <= RADIUS_MAX:
            return JSONResponse({'error': 'invalid_physical_domain'}, status_code=422)
        try:
            return evaluate_activity(body['activityId'], parameters)
        except StudyError as error:
            return JSONResponse({'error': error.code}, status_code=error.status)

    # Register before static files: an API typo must never become index.html 200.
    @app.api_route('/study', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])
    @app.api_route('/study/{path:path}', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])
    async def unavailable_api(path: str = ''):
        return JSONResponse({'error': 'not_found'}, status_code=404)

    if frontend is not None:
        app.mount('/', StaticFiles(directory=frontend, html=True), name='public-preview')
    return app
