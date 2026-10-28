"""Per-app admission of encoded route-body maxima, not an RSS/transport limit.

The reservation covers the whole downstream ASGI call, including response and
cleanup. Small requests can use free space while a larger waiter times out.
"""
from anyio import Event, fail_after
from fastapi import FastAPI
from starlette.datastructures import Headers, URL

from lessonos.study import portable

MIB = 1024 * 1024
SAFE_METHODS = frozenset(('GET', 'HEAD', 'OPTIONS'))


def body_limit(path):
    """One source for body admission weights and the existing streamed 413."""
    if path == '/study/assets':
        return 20 * MIB
    if path == '/study/notebook/inspect':
        return portable.MAX_ENCODED_BYTES
    return 256 * 1024


def boundary_error(scope):
    """Keep host/origin denial ahead of admission and any request receive."""
    url = URL(scope=scope)
    if url.hostname not in ('127.0.0.1', 'localhost', 'testserver'):
        return 'loopback_only'
    if scope['method'] not in SAFE_METHODS:
        origin = Headers(scope=scope).get('origin')
        # Match Request.base_url (including an ASGI root_path) exactly.
        base_scope = dict(scope, path=scope.get('app_root_path', scope.get('root_path', '')) + '/', query_string=b'')
        if origin and origin != str(URL(scope=base_scope)).rstrip('/'):
            return 'origin_denied'
    return None


def validate_body_admission(budget, wait):
    minimum = max(body_limit('/study/assets'), body_limit('/study/notebook/inspect'))
    if type(budget) is not int or budget < minimum:
        raise ValueError('invalid_body_admission')
    if type(wait) not in (int, float) or not 0 < wait <= 60:
        raise ValueError('invalid_body_admission')


class _BodyBudget:
    """Event-loop-owned counters; no await between a successful check/debit.

    Release is synchronous, so cancellation cannot interrupt returning ownership.
    Events only wake waiters: each checks its own weight again, permitting small
    work to proceed without queuing behind a heavy request. No fairness promise.
    """
    def __init__(self, total, wait):
        self.available = total
        self.wait = wait
        self.changed = Event()

    async def acquire(self, weight):
        with fail_after(self.wait):
            while self.available < weight:
                changed = self.changed
                await changed.wait()
            self.available -= weight

    def release(self, weight):
        self.available += weight
        changed, self.changed = self.changed, Event()
        changed.set()


class BodyAdmissionMiddleware:
    def __init__(self, app, *, budget, wait, busy_response, boundary=boundary_error):
        validate_body_admission(budget, wait)
        self.app = app
        self.budget = _BodyBudget(budget, wait)
        self.wait = wait
        self.busy_response = busy_response
        self.boundary = boundary

    async def __call__(self, scope, receive, send):
        if (scope['type'] != 'http' or scope['method'] in SAFE_METHODS
                or self.boundary(scope) is not None):
            # Existing inner host/origin middleware owns the denial response.
            await self.app(scope, receive, send)
            return
        path = URL(scope=scope).path
        weight = body_limit(path)
        try:
            await self.budget.acquire(weight)
        except TimeoutError:
            response = self.busy_response(
                logout=scope['method'] == 'DELETE' and path == '/study/session',
                wait=self.wait)
            await response(scope, receive, send)
            return
        try:
            await self.app(scope, receive, send)
        finally:
            self.budget.release(weight)


class BodyBudgetFastAPI(FastAPI):
    """Wrap the complete framework stack, including ServerErrorMiddleware.

    FastAPI0.139/Starlette1.9 build the automatic500 boundary outside user
    middleware. Calling super preserves exception handlers, routes and cleanup;
    the budget must surround its result to cover a blocked/failing500 send.
    """
    def __init__(self, *, body_budget, body_wait, busy_response, boundary=boundary_error, **kwargs):
        validate_body_admission(body_budget, body_wait)
        super().__init__(**kwargs)
        self._body_admission_options = {
            'budget': body_budget, 'wait': body_wait, 'busy_response': busy_response, 'boundary': boundary}

    def build_middleware_stack(self):
        return BodyAdmissionMiddleware(
            super().build_middleware_stack(), **self._body_admission_options)
