"""Causal encoded-body admission checks; no provider or network IO."""
import asyncio
import pytest
from lessonos.study.models import StudyError
from study_api.app import create_app


class NoProvider:
    """Count attempted Auth/DB entry without touching either external system."""
    def __init__(self):self.opens=0
    def open(self,token=''):
        self.opens+=1
        raise StudyError('unauthenticated',401)


class Exchange:
    def __init__(self,path='/study/notebook/inspect',method='POST',chunks=(b'{}',),gate=None,headers=()):
        self.scope={'type':'http','asgi':{'version':'3.0','spec_version':'2.4'},'http_version':'1.1',
            'method':method,'scheme':'http','path':path,'raw_path':path.encode(),
            'query_string':b'','root_path':'','headers':[(b'host',b'testserver'),*headers],
            'server':('testserver',80),'client':('127.0.0.1',1234)}
        self.chunks=list(chunks);self.gate=gate;self.reads=0;self.messages=[]
        self.entered=asyncio.Event()
    async def receive(self):
        self.reads+=1;self.entered.set()
        if self.gate and self.reads==2:await self.gate.wait()
        if self.chunks:
            chunk=self.chunks.pop(0)
            if isinstance(chunk,dict):return chunk
            return {'type':'http.request','body':chunk,'more_body':bool(self.chunks)}
        await asyncio.Future()
    async def send(self,message):self.messages.append(message)
    @property
    def status(self):return next(m['status'] for m in self.messages if m['type']=='http.response.start')
    async def run(self,app):await app(self.scope,self.receive,self.send)


def test_second_notebook_is_rejected_before_receive_or_auth_while_first_body_is_held(tmp_path):
    runtime=NoProvider();app=create_app(tmp_path/'unused.sqlite',demo=True,runtime=runtime)
    async def exercise():
        release=asyncio.Event()
        first=Exchange(chunks=(b'{',b'}'),gate=release)
        task=asyncio.create_task(first.run(app))
        try:
            await asyncio.wait_for(first.entered.wait(),2)
            second=Exchange(headers=((b'content-length',b'0'),))  # Untrusted size is irrelevant.
            await asyncio.wait_for(second.run(app),2)
            assert {'status':second.status,'receives':second.reads,'authOpens':runtime.opens}=={
                'status':503,'receives':0,'authOpens':0}
        finally:
            release.set();await asyncio.wait_for(task,2)
    asyncio.run(exercise())


MIB=1024*1024


def wait_observer(monkeypatch):
    """Observe an actual capacity wait without replacing its behavior."""
    from study_api.body_admission import _BodyBudget
    waiting=asyncio.Event();original=_BodyBudget.acquire
    async def observed(budget,weight):
        if budget.available<weight:waiting.set()
        return await original(budget,weight)
    monkeypatch.setattr(_BodyBudget,'acquire',observed)
    return waiting


def test_small_body_progresses_while_a_large_body_waits_for_free_capacity(tmp_path,monkeypatch):
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_wait=60)
    async def exercise():
        waiting=wait_observer(monkeypatch)
        release=asyncio.Event();first=Exchange(chunks=(b'{',b'}'),gate=release)
        task=asyncio.create_task(first.run(app));heavy=Exchange();pending=None
        try:
            await asyncio.wait_for(first.entered.wait(),2)
            pending=asyncio.create_task(heavy.run(app))
            await asyncio.wait_for(waiting.wait(),2)
            small=Exchange(path='/study/resources')
            await asyncio.wait_for(small.run(app),2)
            assert small.status!=503 and small.reads>0
            assert not pending.done() and heavy.reads==0
        finally:
            if pending:
                pending.cancel()
                with pytest.raises(asyncio.CancelledError):await pending
            release.set();await asyncio.wait_for(task,2)
        retry=Exchange();await asyncio.wait_for(retry.run(app),2)
        assert retry.status==401 and retry.reads>0
    asyncio.run(exercise())


def test_large_and_asset_fit_together_but_second_asset_does_not(tmp_path):
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_wait=.03)
    async def exercise():
        release=asyncio.Event()
        notebook=Exchange(chunks=(b'{',b'}'),gate=release)
        asset=Exchange(path='/study/assets',chunks=(b'a',b'b'),gate=release)
        tasks=[asyncio.create_task(item.run(app)) for item in (notebook,asset)]
        try:
            await asyncio.wait_for(asyncio.gather(notebook.entered.wait(),asset.entered.wait()),2)
            denied=Exchange(path='/study/assets')
            await asyncio.wait_for(denied.run(app),2)
            assert denied.status==503 and denied.reads==0 and runtime.opens==0
        finally:
            release.set();await asyncio.wait_for(asyncio.gather(*tasks),2)
    asyncio.run(exercise())


def test_cancellation_of_active_body_returns_the_reservation(tmp_path):
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        first=Exchange(chunks=(b'{',b'}'),gate=asyncio.Event())
        task=asyncio.create_task(first.run(app))
        await asyncio.wait_for(first.entered.wait(),2)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):await task
        retry=Exchange();await asyncio.wait_for(retry.run(app),2)
        assert retry.status==401 and retry.reads>0 and runtime.opens==1
    asyncio.run(exercise())


def test_cancellation_of_waiter_cannot_consume_later_capacity(tmp_path,monkeypatch):
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_budget=96*MIB,request_body_wait=60)
    async def exercise():
        waiting=wait_observer(monkeypatch);release=asyncio.Event()
        first=Exchange(chunks=(b'{',b'}'),gate=release)
        task=asyncio.create_task(first.run(app));pending=None
        try:
            await asyncio.wait_for(first.entered.wait(),2)
            blocked=Exchange();pending=asyncio.create_task(blocked.run(app))
            await asyncio.wait_for(waiting.wait(),2)
            pending.cancel()
            with pytest.raises(asyncio.CancelledError):await pending
            assert blocked.reads==0 and runtime.opens==0
        finally:
            release.set();await asyncio.wait_for(task,2)
        retry=Exchange();await asyncio.wait_for(retry.run(app),2)
        assert retry.status==401
    asyncio.run(exercise())


def test_disconnect_returns_capacity(tmp_path):
    from starlette.requests import ClientDisconnect
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        disconnected=Exchange(chunks=(b'{',{'type':'http.disconnect'}))
        with pytest.raises(ClientDisconnect):await disconnected.run(app)
        retry=Exchange();await asyncio.wait_for(retry.run(app),2)
        assert retry.status==401 and runtime.opens==1
    asyncio.run(exercise())


def test_reservation_remains_until_final_response_send_finishes(tmp_path):
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        first=Exchange();sending=asyncio.Event();release=asyncio.Event();original=first.send
        async def held_send(message):
            if message['type']=='http.response.body' and not message.get('more_body',False):
                sending.set();await release.wait()
            await original(message)
        first.send=held_send;task=asyncio.create_task(first.run(app))
        try:
            await asyncio.wait_for(sending.wait(),2)
            denied=Exchange();await asyncio.wait_for(denied.run(app),2)
            assert denied.status==503 and denied.reads==0 and runtime.opens==1
        finally:
            release.set();await asyncio.wait_for(task,2)
        retry=Exchange();await retry.run(app)
        assert retry.status==401 and runtime.opens==2
    asyncio.run(exercise())


@pytest.mark.parametrize('secure',[False,True])
def test_denial_precedence_health_and_explicit_logout_cookie_semantics(tmp_path,secure):
    from http.cookies import SimpleCookie
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,secure_cookies=secure,
        request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        release=asyncio.Event();first=Exchange(chunks=(b'{',b'}'),gate=release)
        task=asyncio.create_task(first.run(app))
        try:
            await asyncio.wait_for(first.entered.wait(),2)
            bad_host=Exchange();bad_host.scope['headers']=[(b'host',b'evil.invalid')]
            bad_origin=Exchange(headers=((b'origin',b'https://evil.invalid'),))
            for probe in (bad_host,bad_origin):
                await probe.run(app);assert probe.status==403 and probe.reads==0
            for method in ('GET','HEAD','OPTIONS'):
                health=Exchange(path='/study/health',method=method)
                await asyncio.wait_for(health.run(app),2)
                assert health.status!=503 and health.reads==0
            denied=Exchange(headers=((b'cookie',b'study_session=valid'),))
            await denied.run(app)
            headers=dict(next(m['headers'] for m in denied.messages if m['type']=='http.response.start'))
            assert denied.status==503 and headers[b'retry-after']==b'1' and headers[b'cache-control']==b'no-store'
            assert b'set-cookie' not in headers and denied.reads==0
            logout=Exchange(path='/study/session',method='DELETE',headers=((b'cookie',b'study_session=valid'),))
            await logout.run(app)
            headers=dict(next(m['headers'] for m in logout.messages if m['type']=='http.response.start'))
            cookie=SimpleCookie();cookie.load(headers[b'set-cookie'].decode())
            assert logout.status==503 and logout.reads==0 and runtime.opens==0
            assert cookie['study_session']['max-age']=='0' and cookie['study_session']['path']=='/'
            assert cookie['study_session']['httponly'] and cookie['study_session']['samesite']=='strict'
            assert bool(cookie['study_session']['secure']) is secure
            assert b'UNCONFIRMED' in b''.join(m.get('body',b'') for m in logout.messages)
        finally:
            release.set();await asyncio.wait_for(task,2)
    asyncio.run(exercise())


@pytest.mark.parametrize('kind,value',[
    ('request_body_budget',0),('request_body_budget',True),('request_body_budget',96*MIB-1),
    ('request_body_budget',float('inf')),('request_body_wait',0),('request_body_wait',True),
    ('request_body_wait',float('nan')),('request_body_wait',float('inf'))])
def test_invalid_configuration_fails_before_any_store_open(tmp_path,kind,value):
    runtime=NoProvider()
    with pytest.raises(ValueError,match='invalid_body_admission'):
        create_app(tmp_path/'unused',demo=True,runtime=runtime,**{kind:value})
    assert runtime.opens==0


def test_unicode_byte_boundary_success_413_422_all_release(tmp_path):
    from fastapi import Request
    from starlette.responses import Response
    from study_api.body_admission import body_limit
    runtime=NoProvider();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,
        request_body_budget=96*MIB,request_body_wait=.03)
    @app.post('/review/echo')
    async def echo(request:Request):return Response(await request.body())
    @app.post('/review/dto')
    def dto(body:dict):return body
    limit=body_limit('/review/echo')
    assert body_limit('/study/notebook/inspect')==96*MIB
    payload=b'"'+('🧪'*(limit//4-1)).encode()+b'xx"'
    assert len(payload)==limit
    async def exercise():
        for path,body,status in [('/review/echo',payload,200),('/review/echo',payload+b' ',413),('/review/dto',b'[]',422)]:
            request=Exchange(path=path,chunks=(body,))
            await request.run(app);assert request.status==status
            if status==200:
                assert b''.join(m.get('body',b'') for m in request.messages)==payload
            retry=Exchange();await retry.run(app)
            assert retry.status==401  # A leaked ordinary reservation would leave <96MiB.
    asyncio.run(exercise())


@pytest.mark.parametrize('cancel',[False,True])
def test_budget_stays_owned_through_worker_cleanup_even_on_cancellation(tmp_path,cancel):
    from test_admission_http import FakeRuntime
    runtime=FakeRuntime('close')
    app=create_app(tmp_path/'unused',demo=True,runtime=runtime,request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        first=Exchange(path='/study/session',chunks=(b'{"token":"valid"}',),
            headers=((b'content-type',b'application/json'),))
        task=asyncio.create_task(first.run(app))
        try:
            assert await asyncio.to_thread(runtime.gate.entered.wait,2)
            if cancel:task.cancel()
            health=Exchange(path='/study/health',method='GET');await health.run(app)
            before=len(runtime.opens)
            denied=Exchange();await denied.run(app)
            assert denied.status==503 and denied.reads==0 and len(runtime.opens)==before
            assert not task.done()
        finally:
            runtime.gate.release.set()
            if cancel:
                with pytest.raises(asyncio.CancelledError):await task
            else:await asyncio.wait_for(task,2)
        retry=Exchange();await retry.run(app)
        assert retry.status!=503 and retry.reads>0 and runtime.active==0
    asyncio.run(exercise())


@pytest.mark.parametrize('fault',['auth_open','ingress_receive'])
@pytest.mark.parametrize('termination',['finish','send_error','cancel'])
def test_body_budget_covers_unhandled_outer_500_response(tmp_path,fault,termination):
    class FaultRuntime(NoProvider):
        def open(self,token=''):
            if fault=='auth_open' and self.opens==0:
                self.opens+=1
                raise RuntimeError('synthetic unexpected open error')
            return super().open(token)
    runtime=FaultRuntime();app=create_app(tmp_path/'unused',demo=True,runtime=runtime,
        request_body_budget=96*MIB,request_body_wait=.03)
    async def exercise():
        first=Exchange();sending=asyncio.Event();release=asyncio.Event();original=first.send
        if fault=='ingress_receive':
            async def broken_receive():raise RuntimeError('synthetic unexpected receive error')
            first.receive=broken_receive
        async def held_send(message):
            await original(message)
            if message['type']=='http.response.body' and not message.get('more_body',False):
                assert first.status==500
                sending.set();await release.wait()
                if termination=='send_error':raise OSError('synthetic failed500 send')
        first.send=held_send;task=asyncio.create_task(first.run(app))
        try:
            await asyncio.wait_for(sending.wait(),2)
            assert not task.done()
            before=runtime.opens
            denied=Exchange();await asyncio.wait_for(denied.run(app),2)
            assert {'status':denied.status,'reads':denied.reads,'newOpens':runtime.opens-before}=={
                'status':503,'reads':0,'newOpens':0}
        finally:
            if termination=='cancel':task.cancel()
            else:release.set()
            expected=asyncio.CancelledError if termination=='cancel' else OSError if termination=='send_error' else RuntimeError
            with pytest.raises(expected):await asyncio.wait_for(task,2)
        retry=Exchange();await retry.run(app)
        assert retry.status==401 and retry.reads>0
    asyncio.run(exercise())


def test_outer_budget_preserves_fastapi_surface_custom_middleware_and_500_handler(tmp_path):
    import json
    from fastapi import FastAPI,Depends
    from starlette.responses import JSONResponse
    class BrokenRuntime(NoProvider):
        def open(self,token=''):raise RuntimeError('synthetic open error')
    app=create_app(tmp_path/'unused',demo=True,runtime=BrokenRuntime())
    assert isinstance(app,FastAPI)
    router=app.router;app.state.marker='retained-state';seen=[]
    class AddedMiddleware:
        def __init__(self,app):self.app=app
        async def __call__(self,scope,receive,send):
            seen.append(scope.get('path'));await self.app(scope,receive,send)
    app.add_middleware(AddedMiddleware)
    def original():return 'original'
    app.dependency_overrides[original]=lambda:'override'
    @app.get('/review/dependencies')
    def dependencies(value=Depends(original)):
        return {'value':value,'state':app.state.marker}
    @app.exception_handler(Exception)
    async def custom_error(request,error):return JSONResponse({'custom500':True},status_code=500)
    assert '/review/dependencies' in app.openapi()['paths']
    assert any(getattr(route,'path',None)=='/review/dependencies' for route in app.routes)
    async def exercise():
        probe=Exchange(path='/review/dependencies',method='GET');await probe.run(app)
        assert probe.status==200 and json.loads(b''.join(m.get('body',b'') for m in probe.messages))=={
            'value':'override','state':'retained-state'}
        failure=Exchange()
        with pytest.raises(RuntimeError):await failure.run(app)
        assert failure.status==500
        assert len([m for m in failure.messages if m['type']=='http.response.start'])==1
        assert json.loads(b''.join(m.get('body',b'') for m in failure.messages))=={'custom500':True}
        assert seen==['/review/dependencies','/study/notebook/inspect']
        assert app.router is router
    asyncio.run(exercise())
