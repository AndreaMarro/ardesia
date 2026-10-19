"""Loopback-only synthetic M1 adapter. No production authentication claims."""
import json,sqlite3,os
from lessonos.study.store import digest
from pathlib import Path
from fastapi import FastAPI, Request, Response, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore


class SessionBody(BaseModel):
    token: str = Field(min_length=1, max_length=256)


class ResourceBody(BaseModel):
    editionId: str
    kind: str = 'notes'
    text: str = Field(min_length=1, max_length=20000)
    visibility: str = 'private'


def create_app(db_path: Path, *, demo=False, frontend: Path | None = None, secure_cookies=False, auth_limit=30):
    if not demo:
        raise ValueError('synthetic_only: production authentication and consent require M2')
    from lessonos.study.operations import resume_erasures
    resume_erasures(Path(db_path).parent)
    app = FastAPI(title='Ardesia Study — synthetic M1', version='0.1.0')

    @app.exception_handler(StudyError)
    async def domain_error(request, exc):
        return JSONResponse({'error':exc.code}, status_code=exc.status)

    @app.exception_handler(sqlite3.Error)
    async def storage_error(request, exc):
        return JSONResponse({'error':'storage_unavailable'},status_code=503)

    @app.exception_handler(OSError)
    async def io_error(request, exc):
        return JSONResponse({'error':'storage_unavailable'},status_code=503)

    @app.middleware('http')
    async def local_boundary(request: Request, call_next):
        host = request.url.hostname
        if host not in ('127.0.0.1', 'localhost', 'testserver'):
            return JSONResponse({'error':'loopback_only'}, status_code=403)
        if request.method not in ('GET','HEAD','OPTIONS'):
            origin = request.headers.get('origin')
            if origin and origin != str(request.base_url).rstrip('/'):
                return JSONResponse({'error':'origin_denied'}, status_code=403)
            # UTF-8/escaped 20k-character notes fit 256 KiB; notebook framing
            # includes base64 for up to 50 MiB of decoded original assets.
            limit=20*1024*1024 if request.url.path=='/study/assets' else 96*1024*1024 if request.url.path=='/study/notebook/inspect' else 256*1024
            data=bytearray()
            async for chunk in request.stream():
                data.extend(chunk)
                if len(data)>limit:return JSONResponse({'error':'payload_too_large'},status_code=413)
            request._body=bytes(data)
            if request.url.path in ('/study/session','/study/invitations/accept','/study/interests'):
                limiter=StudyStore(db_path)
                try:allowed,retry=limiter.allow_request(digest((request.client.host if request.client else 'unknown')+request.url.path),auth_limit)
                finally:limiter.close()
                if not allowed:return JSONResponse({'error':'rate_limited'},status_code=429,headers={'Retry-After':str(retry)})
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response

    async def store_dependency():
        store = StudyStore(db_path)
        try:
            yield store
        finally:
            store.close()

    def authenticate(request, store):
        principal = store.principal_for_session(request.cookies.get('study_session',''))
        if principal is None:
            raise StudyError('unauthenticated',401)
        return principal

    @app.get('/study/health')
    async def health():
        return {'ok':True, 'synthetic':True, 'provider':'deterministic_fake', 'apiSpendUsd':0,'processId':os.getpid(),'dataId':digest(str(Path(db_path).resolve()))[:16]}

    @app.get('/study/ops/health')
    async def readiness(request: Request, store=Depends(store_dependency)):
        principal=authenticate(request,store)
        if principal.role!='teacher':raise StudyError('forbidden',403)
        from lessonos.study.operations import check_data
        result=check_data(Path(db_path).parent)
        return JSONResponse(result,status_code=200 if result['ok'] else 503)

    @app.post('/study/session')
    async def session(body: SessionBody, response: Response, store=Depends(store_dependency)):
        principal = store.principal_for_session(body.token)
        if principal is None:
            raise StudyError('invalid_demo_access',401)
        token = store.issue_session(principal)
        response.set_cookie('study_session', token, httponly=True, secure=secure_cookies, samesite='strict', max_age=3600)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.post('/study/invitations/accept')
    async def accept_invitation(body: SessionBody, response: Response, store=Depends(store_dependency)):
        token=store.accept_invitation(body.token)
        principal=store.principal_for_session(token)
        response.set_cookie('study_session',token,httponly=True,secure=secure_cookies,samesite='strict',max_age=3600)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.post('/study/editions/{edition_id}/invitations')
    async def invitation(edition_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        return store.create_invitation(authenticate(request,store),edition_id,body.get('actorId'))

    @app.get('/study/editions/{edition_id}/access')
    async def access_list(edition_id: str, request: Request, store=Depends(store_dependency)):
        store._edition_access(authenticate(request,store),edition_id,teacher_only=True)
        return {'members':[row[0] for row in store.connection.execute('SELECT student_id FROM study_members WHERE edition_id=? ORDER BY student_id',(edition_id,))],
                'invitations':[dict(row) for row in store.connection.execute('SELECT id,actor_id,state,expires_at FROM study_invitations WHERE edition_id=? ORDER BY id',(edition_id,))]}

    @app.delete('/study/invitations/{invitation_id}')
    async def revoke_invitation(invitation_id: str, request: Request, store=Depends(store_dependency)):
        store.revoke_invitation(authenticate(request,store),invitation_id)
        return {'revoked':True}

    @app.post('/study/session/revoke-all')
    async def revoke_all(request: Request, response: Response, store=Depends(store_dependency)):
        store.revoke_all_sessions(authenticate(request,store))
        response.delete_cookie('study_session',secure=secure_cookies,samesite='strict')
        return {'revoked':True}

    @app.delete('/study/session')
    async def logout(request: Request, response: Response, store=Depends(store_dependency)):
        store.revoke_session(request.cookies.get('study_session',''))
        response.delete_cookie('study_session')
        return {'ok':True}

    @app.get('/study/me')
    async def me(request: Request, store=Depends(store_dependency)):
        principal = authenticate(request,store)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

    @app.post('/study/resources')
    async def create_resource(body: ResourceBody, request: Request, store=Depends(store_dependency)):
        return store.create_resource(authenticate(request,store),body.editionId,body.kind,body.text,body.visibility)

    @app.get('/study/resources/{resource_id}')
    async def resource(resource_id: str, request: Request, store=Depends(store_dependency)):
        return store.get_resource(authenticate(request,store),resource_id)

    @app.get('/study/course')
    async def course(store=Depends(store_dependency)):
        edition=store.get_edition('fluidi')
        count=store.connection.execute("SELECT COUNT(*) FROM study_members WHERE edition_id='fluidi'").fetchone()[0]
        return {key:edition[key] for key in ('id','capacity','priceMinor','state','sessions','timezone')} | {
            'title':'Fisica: relazioni e fluidi', 'confirmedTest':count,'available':edition['capacity']-count,
            'synthetic':True,'editorialStatus':'DRAFT','duration':'4 incontri da 90 minuti',
            'scope':'Proporzioni, unità e fluidi. Il modulo non copre l’intero syllabus.'}

    @app.post('/study/activities/evaluate')
    async def evaluate(body: dict):
        from lessonos.study.activities import evaluate_activity
        return evaluate_activity(body.get('activityId'),body.get('parameters',{}))

    @app.get('/study/coursepack')
    async def coursepack():
        from lessonos.study.coursepack import load_coursepack
        return load_coursepack()

    @app.post('/study/interests')
    async def interest(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import record_interest
        return record_interest(store,body,request.headers.get('Idempotency-Key',''))

    @app.get('/study/interests')
    async def interests(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import list_interests
        return list_interests(store,authenticate(request,store),editionId)

    @app.get('/study/workspace')
    async def workspace(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import list_submissions
        from lessonos.study.feedback import list_feedback
        principal=authenticate(request,store)
        edition=store.get_edition(editionId)
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
        layout=store.connection.execute('SELECT data FROM study_layouts WHERE actor_id=? AND edition_id=?',(principal.id,editionId)).fetchone()
        return {'enrolled':True,'edition':edition,'resources':resources,'submissions':submissions,'layouts':json.loads(layout[0]) if layout else []}

    @app.post('/study/editions/{edition_id}/holds')
    async def hold(edition_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.groups import reserve_seat
        return reserve_seat(store,authenticate(request,store),edition_id,request.headers.get('Idempotency-Key',''),store.clock())

    @app.post('/study/holds/{hold_id}/confirm')
    async def confirm(hold_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.groups import confirm_test_enrollment
        return confirm_test_enrollment(store,authenticate(request,store),hold_id,request.headers.get('Idempotency-Key',''),store.clock())

    @app.post('/study/editions/{edition_id}/approve')
    async def approve(edition_id: str, request: Request, store=Depends(store_dependency)):
        principal=authenticate(request,store)
        edition=store._edition_access(principal,edition_id,teacher_only=True)
        if len(edition['sessions'])!=4:raise StudyError('four_sessions_required')
        with store.transaction() as c:
            c.execute("UPDATE study_editions SET state='offered' WHERE id=?",(edition_id,))
            store._event(c,principal,'edition.approved',None,{'editionId':edition_id})
        return store.get_edition(edition_id)

    @app.post('/study/layout')
    async def layout(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.store import canonical
        principal=authenticate(request,store);edition_id=body.get('editionId')
        store._edition_access(principal,edition_id)
        views=body.get('views')
        if not isinstance(views,list) or len(views)>50:raise StudyError('invalid_layout')
        seen=set()
        for view in views:
            ref=view.get('pluginState',{})
            resource=store.get_resource(principal,ref.get('resourceId'))
            if resource['editionId']!=edition_id or resource['contextId']!=ref.get('contextId'):raise StudyError('invalid_layout')
            if view.get('instanceId') in seen:raise StudyError('invalid_layout')
            seen.add(view.get('instanceId'))
            bounds=view.get('bounds',{})
            if any(type(bounds.get(k)) not in (float,int) or not -10000<bounds[k]<10000 for k in ('x','y','width','height')):raise StudyError('invalid_layout')
        with store.transaction() as c:
            c.execute('INSERT INTO study_layouts VALUES(?,?,?) ON CONFLICT(actor_id,edition_id) DO UPDATE SET data=excluded.data',(principal.id,edition_id,canonical(views)))
        return {'saved':True}

    @app.post('/study/assets')
    async def upload(request: Request, editionId: str, store=Depends(store_dependency)):
        from lessonos.study.assets import upload_asset
        principal=authenticate(request,store)
        data=bytearray()
        async for chunk in request.stream():
            data.extend(chunk)
            if len(data)>20*1024*1024:raise StudyError('asset_too_large',413)
        return upload_asset(store,principal,editionId,bytes(data),request.headers.get('Content-Type',''),Path(db_path).parent/'blobs')

    @app.get('/study/assets/{asset_id}')
    async def asset(asset_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.assets import read_asset
        data,mime=read_asset(store,authenticate(request,store),asset_id,Path(db_path).parent/'blobs')
        return Response(data,media_type=mime,headers={'Content-Disposition':f'attachment; filename="original-{asset_id}"','Cache-Control':'no-store'})

    @app.post('/study/submissions')
    async def submission(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import submit
        return submit(store,authenticate(request,store),body.get('editionId'),body.get('activityId'),body.get('assetRefs',[]),body.get('text',''),request.headers.get('Idempotency-Key',''),body.get('parentId'),body.get('sourceRefs',[]))

    @app.get('/study/receipts/{receipt_id}')
    async def receipt(receipt_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.submissions import get_receipt
        return get_receipt(store,authenticate(request,store),receipt_id)

    @app.post('/study/feedback/drafts')
    async def candidate(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.feedback import propose_feedback
        return propose_feedback(store,authenticate(request,store),body.get('submissionId'))

    @app.post('/study/feedback/{candidate_id}/publish')
    async def publish(candidate_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.feedback import review_feedback
        return review_feedback(store,authenticate(request,store),candidate_id,body.get('expectedRevision'),body.get('text'),request.headers.get('Idempotency-Key',''),body.get('decision','returned'))

    @app.post('/study/resources/{resource_id}/revise')
    async def revise(resource_id: str, body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.context import revise_resource
        return revise_resource(store,authenticate(request,store),resource_id,body.get('expectedRevision'),body.get('text'))

    @app.delete('/study/resources/{resource_id}')
    async def remove(resource_id: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.context import delete_resource
        delete_resource(store,authenticate(request,store),resource_id)
        return {'deleted':True}

    @app.get('/study/context/{context_id}')
    async def context(context_id: str, request: Request, query: str='', store=Depends(store_dependency)):
        from lessonos.study.context import retrieve_context
        return retrieve_context(store,authenticate(request,store),context_id,query)

    @app.post('/study/hints')
    async def hint(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.ai_jobs import request_hint
        return request_hint(store,authenticate(request,store),body.get('resourceId'),body.get('level'),request.headers.get('Idempotency-Key',''))

    @app.get('/study/notebook')
    async def notebook(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.portable import export_notebook
        return export_notebook(store,authenticate(request,store),editionId,Path(db_path).parent/'blobs')

    @app.post('/study/notebook/inspect')
    async def inspect(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.portable import inspect_notebook
        authenticate(request,store)
        return inspect_notebook(body)

    if frontend:
        from fastapi.staticfiles import StaticFiles
        app.mount('/', StaticFiles(directory=frontend,html=True),name='studio')
    return app
