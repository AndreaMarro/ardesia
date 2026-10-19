"""Loopback-only synthetic M1 adapter. No production authentication claims."""
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


def create_app(db_path: Path, *, demo=False, frontend: Path | None = None):
    if not demo:
        raise ValueError('synthetic_only: production authentication and consent require M2')
    app = FastAPI(title='Ardesia Study — synthetic M1', version='0.1.0')

    @app.exception_handler(StudyError)
    async def domain_error(request, exc):
        return JSONResponse({'error':exc.code}, status_code=exc.status)

    @app.middleware('http')
    async def local_boundary(request: Request, call_next):
        host = request.url.hostname
        if host not in ('127.0.0.1', 'localhost', 'testserver'):
            return JSONResponse({'error':'loopback_only'}, status_code=403)
        if request.method not in ('GET','HEAD','OPTIONS'):
            origin = request.headers.get('origin')
            if origin and origin != str(request.base_url).rstrip('/'):
                return JSONResponse({'error':'origin_denied'}, status_code=403)
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
        return {'ok':True, 'synthetic':True, 'provider':'deterministic_fake', 'apiSpendUsd':0}

    @app.post('/study/session')
    async def session(body: SessionBody, response: Response, store=Depends(store_dependency)):
        principal = store.principal_for_session(body.token)
        if principal is None:
            raise StudyError('invalid_demo_access',401)
        token = store.issue_session(principal)
        response.set_cookie('study_session', token, httponly=True, samesite='strict', max_age=3600)
        return {'id':principal.id,'role':principal.role,'synthetic':True}

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

    @app.post('/study/interests')
    async def interest(body: dict, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import record_interest
        return record_interest(store,body,request.headers.get('Idempotency-Key',''))

    @app.get('/study/interests')
    async def interests(editionId: str, request: Request, store=Depends(store_dependency)):
        from lessonos.study.interests import list_interests
        return list_interests(store,authenticate(request,store),editionId)

    if frontend:
        from fastapi.staticfiles import StaticFiles
        app.mount('/', StaticFiles(directory=frontend,html=True),name='studio')
    return app
