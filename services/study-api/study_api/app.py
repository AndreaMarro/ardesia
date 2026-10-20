"""Loopback-only synthetic M1 adapter. No production authentication claims."""
import json,sqlite3,os
from contextlib import asynccontextmanager
import math
from anyio import CancelScope, CapacityLimiter, Semaphore, create_task_group, fail_after, to_thread
from lessonos.study.store import digest
from pathlib import Path
from fastapi import Request, Response, Depends, Query
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore, MAX_EDITION_CURSOR_LENGTH
from lessonos.study import portable as notebook_portable


class SessionBody(BaseModel):
    token: str = Field(min_length=1, max_length=8192)


class ResourceBody(BaseModel):
    editionId: str
    kind: str = 'notes'
    text: str = Field(min_length=1, max_length=20000)
    visibility: str = 'private'


def create_app(db_path: Path, *, demo=False, frontend: Path | None = None, secure_cookies=False, auth_limit=30, runtime=None,
               request_store_limit=16, request_store_wait=.5, calendar_provider=None,
               request_body_budget=128*1024*1024, request_body_wait=.5):
    if not demo:
        raise ValueError('synthetic_only: production authentication and consent require M2')
    if type(request_store_limit) is not int or not 1 <= request_store_limit <= 1024:
        raise ValueError('invalid_store_admission')
    if type(request_store_wait) not in (int, float) or not 0 < request_store_wait <= 60:
        raise ValueError('invalid_store_admission')
    from .body_admission import BodyBudgetFastAPI, body_limit, boundary_error, validate_body_admission
    validate_body_admission(request_body_budget, request_body_wait)
    from lessonos.study.operations import resume_erasures
    if runtime is None:
        resume_erasures(Path(db_path).parent)
    store_slots = Semaphore(request_store_limit)
    cookie_options={'path':'/','httponly':True,'secure':secure_cookies,'samesite':'strict'}

    def clear_session_cookie(response):
        response.delete_cookie('study_session',**cookie_options)

    def record_cookie_rejection(request,error):
        # This signal is set only by the cookie-authentication boundaries,
        # never by a body-token exchange or by an arbitrary route's 401.
        if error.status==401 and 'study_session' in request.cookies:
            request.state.rejected_study_session=True

    def busy_response(*, logout=False, wait=None):
        body={'error':'server_busy'}
        if logout:body['serverRevocation']='UNCONFIRMED'
        response=JSONResponse(body,status_code=503,headers={
            'Retry-After':str(max(1,math.ceil(request_store_wait if wait is None else wait))),
            'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
        if logout:clear_session_cookie(response)
        return response

    app = BodyBudgetFastAPI(title='Ardesia Study — synthetic M1', version='0.1.0',
                            body_budget=request_body_budget, body_wait=request_body_wait,
                            busy_response=busy_response)

    @app.exception_handler(StudyError)
    async def domain_error(request, exc):
        if exc.code=='server_busy':return busy_response()
        response=JSONResponse({'error':exc.code}, status_code=exc.status)
        if exc.status==401 and getattr(request.state,'rejected_study_session',False):
            clear_session_cookie(response)
        return response

    @app.exception_handler(sqlite3.Error)
    async def storage_error(request, exc):
        return JSONResponse({'error':'storage_unavailable'},status_code=503)

    @app.exception_handler(OSError)
    async def io_error(request, exc):
        return JSONResponse({'error':'storage_unavailable'},status_code=503)

    if runtime is not None:
        import psycopg
        @app.exception_handler(psycopg.Error)
        async def postgres_error(request, exc):
            return JSONResponse({'error':'storage_unavailable'},status_code=503)

    @asynccontextmanager
    async def admitted_store(token=''):
        # Admission precedes remote Auth, DB opening and worker dispatch. This
        # is a per-app scope bound, independent of the ordinary worker budget.
        try:
            with fail_after(request_store_wait):
                await store_slots.acquire()
        except TimeoutError:
            raise StudyError('server_busy',503) from None
        try:
            def open_store():
                return runtime.open(token) if runtime else StudyStore(db_path,check_same_thread=False)
            # Shields surround ownership transfer and disposal separately;
            # no cancel scope crosses the dependency yield/handler boundary.
            with CancelScope(shield=True):
                store=await run_in_threadpool(open_store)
            try:
                yield store
            finally:
                with CancelScope(shield=True):
                    await to_thread.run_sync(store.close,limiter=CapacityLimiter(1))
        finally:
            store_slots.release()

    async def allow_attempt(request):
        # Release the counter's scope before the login/interest route acquires
        # its own scope, including when the configured admission limit is one.
        result, failure = None, None
        async def count():
            nonlocal result, failure
            try:
                async with admitted_store() as limiter:
                    with CancelScope(shield=True):
                        result=await run_in_threadpool(limiter.allow_request,
                            digest((request.client.host if request.client else 'unknown')+request.url.path),auth_limit)
            except Exception as error:
                failure=error
        # A raw caller cancellation becomes structured child cancellation.
        # The worker finishes before close/release, even in this middleware
        # phase that precedes the downstream ASGI task group.
        async with create_task_group() as group:
            group.start_soon(count)
        if failure is not None:raise failure
        return result

    @app.middleware('http')
    async def local_boundary(request: Request, call_next):
        denied = boundary_error(request.scope)
        if denied:
            return JSONResponse({'error':denied}, status_code=403)
        if request.method not in ('GET','HEAD','OPTIONS'):
            # UTF-8/escaped 20k-character notes fit 256 KiB; notebook framing
            # includes base64 for up to 50 MiB of decoded original assets.
            notebook_inspect=request.url.path=='/study/notebook/inspect'
            limit=body_limit(request.url.path)
            data=bytearray()
            async for chunk in request.stream():
                data.extend(chunk)
                if len(data)>limit:return JSONResponse({'error':'notebook_budget_exceeded' if notebook_inspect else 'payload_too_large'},status_code=413)
            request._body=bytes(data)
            if request.url.path in ('/study/session','/study/invitations/accept','/study/interests'):
                try:allowed,retry=await allow_attempt(request)
                except StudyError as error:
                    if error.code!='server_busy':raise
                    return busy_response(logout=request.method=='DELETE' and request.url.path=='/study/session')
                if not allowed:return JSONResponse({'error':'rate_limited'},status_code=429,headers={'Retry-After':str(retry)})
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    async def store_dependency(request: Request):
        # Re-authentication and local logout must remain possible with an old,
        # expired HttpOnly cookie. Protected routes still validate it normally.
        recovery = request.url.path in ('/study/session','/study/invitations/accept')
        token = '' if recovery else request.cookies.get('study_session','')
        opened=False
        try:
            async with admitted_store(token) as store:
                opened=True
                yield store
        except StudyError as error:
            # Only open(token-from-cookie) verifies Auth here. A failure after
            # yield can belong to the handler/close and proves no such fact.
            if runtime is not None and token and not opened:
                record_cookie_rejection(request,error)
            raise

    async def session_store_dependency(body: SessionBody):
        # FastAPI validates this same bounded body once; an old cookie cannot
        # override the exchanged token or supply a role/actor identity.
        async with admitted_store(body.token if runtime else '') as store:
            yield store

    def authenticate(request, store):
        try:
            if runtime is not None:
                return runtime.principal(store)
            principal = store.principal_for_session(request.cookies.get('study_session',''))
            if principal is None:
                raise StudyError('unauthenticated',401)
            return principal
        except StudyError as error:
            record_cookie_rejection(request,error)
            raise

    @app.get('/study/health')
    async def health():
        return {'ok':True, 'synthetic':True, 'provider':'deterministic_fake', 'apiSpendUsd':0,'processId':os.getpid(),'dataId':digest(str(Path(db_path).resolve()))[:16],
            'persistence':'postgres' if runtime else 'sqlite','authentication':'supabase' if runtime else 'synthetic_session',
            'capabilities':{'invitationCodes':runtime is None}}

    @app.get('/study/ops/health')
    def readiness(request: Request, store=Depends(store_dependency)):
        principal=authenticate(request,store)
        if principal.role!='teacher':raise StudyError('forbidden',403)
        if runtime is not None:
            return JSONResponse({'ok':False,'persistence':'postgres','backup':'NOT_YET_VERIFIED'},status_code=503)
        from lessonos.study.operations import check_data
        result=check_data(Path(db_path).parent)
        return JSONResponse(result,status_code=200 if result['ok'] else 503)

    @app.post('/study/session')
    def session(body: SessionBody, response: Response, store=Depends(session_store_dependency)):
        if runtime is not None:
            principal = runtime.principal(store)
            response.set_cookie('study_session', body.token, max_age=3600, **cookie_options)
            return {'id':principal.id,'role':principal.role,'synthetic':True,'authentication':'supabase'}
        principal = store.principal_for_session(body.token)
        if principal is None:
            raise StudyError('invalid_demo_access',401)
        token = store.issue_session(principal)
        response.set_cookie('study_session', token, max_age=3600, **cookie_options)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.post('/study/invitations/accept')
    def accept_invitation(body: SessionBody, response: Response, store=Depends(store_dependency)):
        if runtime is not None:raise StudyError('supabase_invitation_not_configured',501)
        token=store.accept_invitation(body.token)
        principal=store.principal_for_session(token)
        response.set_cookie('study_session',token,max_age=3600,**cookie_options)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.get('/study/editions')
    def editions(request: Request, limit: int=Query(50, ge=1, le=100),
                 after: str | None=Query(None, min_length=1, max_length=MAX_EDITION_CURSOR_LENGTH),
                 editionId: str | None=Query(None, min_length=1, max_length=MAX_EDITION_CURSOR_LENGTH), store=Depends(store_dependency)):
        return store.list_editions(authenticate(request,store),limit=limit,after=after,edition_id=editionId)

    @app.post('/study/editions/{edition_id}/invitations')
    def invitation(edition_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        if runtime is not None:raise StudyError('supabase_invitation_not_configured',501)
        return store.create_invitation(authenticate(request,store),edition_id,body.get('actorId'))

    @app.get('/study/editions/{edition_id}/access')
    def access_list(edition_id: str, request: Request, store=Depends(store_dependency)):
        store._edition_access(authenticate(request,store),edition_id,teacher_only=True)
        return {'capabilities':{'invitationCodes':runtime is None},'members':[row[0] for row in store.connection.execute('SELECT student_id FROM study_members WHERE edition_id=? ORDER BY student_id',(edition_id,))],
                'waitlist':[row[0] for row in store.connection.execute('SELECT student_id FROM study_waitlist WHERE edition_id=? ORDER BY student_id',(edition_id,))],
                'invitations':[dict(row) for row in store.connection.execute('SELECT id,actor_id,state,expires_at FROM study_invitations WHERE edition_id=? ORDER BY id',(edition_id,))]}

    @app.delete('/study/invitations/{invitation_id}')
    def revoke_invitation(invitation_id: str, request: Request, store=Depends(store_dependency)):
        store.revoke_invitation(authenticate(request,store),invitation_id)
        return {'revoked':True}

    @app.post('/study/session/revoke-all')
    def revoke_all(request: Request, response: Response, store=Depends(store_dependency)):
        principal=authenticate(request,store)
        if runtime is not None:runtime.sign_out(request.cookies.get('study_session',''),all_sessions=True,store=store)
        else:store.revoke_all_sessions(principal)
        clear_session_cookie(response)
        return {'revoked':True}

    @app.delete('/study/session')
    async def logout(request: Request, response: Response):
        token=request.cookies.get('study_session','')
        try:
            async with admitted_store(token if runtime else '') as store:
                def revoke():
                    if runtime is not None:runtime.sign_out(token,store=store)
                    else:store.revoke_session(token)
                await run_in_threadpool(revoke)
        except StudyError as error:
            if error.code=='server_busy':
                return busy_response(logout=True)
            if error.status!=401:
                clear_session_cookie(response)
                return {'ok':True,'serverRevocation':'UNCONFIRMED'}
        clear_session_cookie(response)
        return {'ok':True}

    @app.get('/study/me')
    def me(request: Request, store=Depends(store_dependency)):
        principal = authenticate(request,store)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.post('/study/resources')
    def create_resource(body: ResourceBody, request: Request, store=Depends(store_dependency)):
        return store.create_resource(authenticate(request,store),body.editionId,body.kind,body.text,body.visibility,key=request.headers.get('Idempotency-Key'))

    @app.get('/study/resources/{resource_id}')
    def resource(resource_id: str, request: Request, store=Depends(store_dependency)):
        return store.get_resource(authenticate(request,store),resource_id)

    @app.get('/study/resources/{resource_id}/revisions/{revision_id}')
    def resource_revision(resource_id: str, revision_id: str, request: Request, store=Depends(store_dependency)):
        return store.get_resource_revision(authenticate(request,store),resource_id,revision_id)

    @app.get('/study/course')
    def course(request: Request, editionId: str='fluidi', store=Depends(store_dependency)):
        from lessonos.study.catalog import edition_pack
        from lessonos.study.coursepack import load_coursepack
        from lessonos.study.editions import public_edition
        edition=public_edition(store,editionId,authenticate(request,store) if request.cookies.get('study_session') else None)
        binding=edition_pack(store,editionId)
        pack=load_coursepack(binding['packId'],binding['packVersion'])
        if runtime is not None:
            count=runtime.catalog(store,editionId)['confirmedTest']
        else:
            count=store.connection.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?',(editionId,)).fetchone()[0]
        return {key:edition[key] for key in ('id','capacity','priceMinor','state','sessions','timezone')} | binding | {
            'confirmedTest':count,'available':edition['capacity']-count,
            'synthetic':True,'editorialStatus':pack['status'],'scope':pack['scope']}

    @app.post('/study/activities/evaluate')
    def evaluate(body: dict):
        from lessonos.study.activities import evaluate_activity
        return evaluate_activity(body.get('activityId'),body.get('parameters',{}))

    @app.get('/study/coursepack')
    def coursepack(request: Request, editionId: str='fluidi', store=Depends(store_dependency)):
        from lessonos.study.coursepack import load_coursepack
        from lessonos.study.editions import public_edition
        edition=public_edition(store,editionId,authenticate(request,store) if request.cookies.get('study_session') else None)
        return load_coursepack(edition['packId'],edition['packVersion'])

    @app.post('/study/interests')
    def interest(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import record_interest
        return record_interest(store,body,request.headers.get('Idempotency-Key',''))

    @app.get('/study/interests')
    def interests(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import list_interests
        return list_interests(store,authenticate(request,store),editionId)

    @app.get('/study/workspace')
    def workspace(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import list_submissions
        from lessonos.study.feedback import list_feedback
        principal=authenticate(request,store)
        from lessonos.study.editions import public_edition
        edition=public_edition(store,editionId,principal)
        member=bool(store.connection.execute('SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?',(editionId,principal.id)).fetchone())
        if principal.role=='teacher' and principal.id!=edition['teacherId']:raise StudyError('forbidden',403)
        if not member and principal.role!='teacher':return {'enrolled':False,'edition':edition,'resources':[],'submissions':[],'layouts':[]}
        rows=store.connection.execute('SELECT id FROM study_resources WHERE edition_id=? AND deleted=0',(editionId,)).fetchall()
        resources=[]
        for row in rows:
            try:resources.append(store.get_resource(principal,row['id']))
            except StudyError:pass
        submissions=list_submissions(store,principal,editionId)
        for item in submissions:item['feedback']=list_feedback(store,principal,item['id'])
        from lessonos.study.view_layout import load_layout
        return {'enrolled':True,'edition':edition,'resources':resources,'submissions':submissions,**load_layout(store,principal,editionId)}

    @app.post('/study/editions/{edition_id}/holds')
    def hold(edition_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.groups import reserve_seat
        return reserve_seat(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),store.clock())

    @app.post('/study/holds/{hold_id}/confirm')
    def confirm(hold_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.groups import confirm_test_enrollment
        return confirm_test_enrollment(store,authenticate(request,store),hold_id,request.headers.get('Idempotency-Key',''),store.clock())

    @app.post('/study/editions/{edition_id}/approve')
    def approve(edition_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.editions import owned_edition
        owned_edition(store,authenticate(request,store),edition_id,store.connection)
        return JSONResponse({'error':'offer_preview_required',
            'message':'Use the tutor offer preview, then explicitly confirm its revision.',
            'preview':'/study/admin/editions/'+edition_id+'/offer/preview',
            'confirm':'/study/admin/editions/'+edition_id+'/offer/confirm'},status_code=409)

    @app.post('/study/layout')
    def layout(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.view_layout import save_layout
        return save_layout(store,authenticate(request,store),body.get('editionId'),body.get('views'),body.get('expectedVersion'))

    @app.post('/study/assets')
    async def upload(request: Request, editionId: str, store=Depends(store_dependency)):
        from lessonos.study.assets import upload_asset
        key=request.headers.get('Idempotency-Key','')
        if not 1<=len(key)<=256:raise StudyError('idempotency_key_required')
        data=bytearray()
        async for chunk in request.stream():
            data.extend(chunk)
            if len(data)>20*1024*1024:raise StudyError('asset_too_large',413)
        def store_original():
            return upload_asset(store,authenticate(request,store),editionId,bytes(data),
                request.headers.get('Content-Type',''),Path(db_path).parent/'blobs',key=key)
        return await run_in_threadpool(store_original)

    @app.get('/study/assets/{asset_id}')
    def asset(asset_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.assets import read_asset
        data,mime=read_asset(store,authenticate(request,store),asset_id,Path(db_path).parent/'blobs')
        return Response(data,media_type=mime,headers={'Content-Disposition':f'attachment; filename="original-{asset_id}"','Cache-Control':'no-store'})

    @app.post('/study/submissions')
    def submission(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import submit
        return submit(store,authenticate(request,store),body.get('editionId'),body.get('activityId'),body.get('assetRefs',[]),body.get('text',''),request.headers.get('Idempotency-Key',''),body.get('parentId'),body.get('sourceRefs',[]),body.get('diaryThreadId'),body.get('activityParameters'))

    @app.get('/study/receipts/{receipt_id}')
    def receipt(receipt_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import get_receipt
        return get_receipt(store,authenticate(request,store),receipt_id)

    @app.post('/study/feedback/drafts')
    def candidate(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.feedback import propose_feedback
        return propose_feedback(store,authenticate(request,store),body.get('submissionId'))

    @app.post('/study/feedback/{candidate_id}/publish')
    def publish(candidate_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.feedback import review_feedback
        return review_feedback(store,authenticate(request,store),candidate_id,body.get('expectedRevision'),body.get('text'),request.headers.get('Idempotency-Key',''),body.get('decision','returned'))

    @app.post('/study/resources/{resource_id}/revise')
    def revise(resource_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.context import revise_resource
        return revise_resource(store,authenticate(request,store),resource_id,body.get('expectedRevision'),body.get('text'))

    @app.delete('/study/resources/{resource_id}')
    def remove(resource_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.context import delete_resource
        delete_resource(store,authenticate(request,store),resource_id)
        return {'deleted':True}

    @app.get('/study/context/{context_id}')
    def context(context_id: str, request: Request, query: str='', resourceId: str | None=None, revisionId: str | None=None, store=Depends(store_dependency)):
        from lessonos.study.context import retrieve_context
        return retrieve_context(store,authenticate(request,store),context_id,query,resource_id=resourceId,revision_id=revisionId)

    @app.post('/study/hints')
    def hint(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.ai_jobs import request_hint
        return request_hint(store,authenticate(request,store),body.get('resourceId'),body.get('level'),request.headers.get('Idempotency-Key',''))

    @app.get('/study/notebook')
    def notebook(editionId: str, request: Request, store=Depends(store_dependency)):
        bundle=notebook_portable.export_notebook(store,authenticate(request,store),editionId,Path(db_path).parent/'blobs')
        return Response(notebook_portable.encode_notebook(bundle),media_type='application/json')

    @app.post('/study/notebook/inspect')
    def inspect(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.portable import inspect_notebook
        authenticate(request,store)
        return inspect_notebook(body)

    from .admin_routes import install_admin_routes
    install_admin_routes(app,store_dependency,authenticate)
    from .diary_routes import install_diary_routes
    install_diary_routes(app, store_dependency, authenticate)
    from .calendar_routes import install_calendar_routes
    from lessonos.study.calendar_mock import MockCalendar
    install_calendar_routes(app,store_dependency,authenticate,calendar_provider if calendar_provider is not None else MockCalendar())

    if frontend:
        from fastapi.staticfiles import StaticFiles
        app.mount('/', StaticFiles(directory=frontend,html=True),name='studio')
    return app
