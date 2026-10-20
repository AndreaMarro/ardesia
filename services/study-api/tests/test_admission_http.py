"""Causal connection-admission checks, with local fake Auth/DB boundaries."""
import asyncio
import threading
import httpx
import pytest
from lessonos.study.models import Principal, StudyError
from study_api.app import create_app
from study_api.runtime import SupabaseRuntime


class Gate:
    def __init__(self):
        self.entered=threading.Event();self.release=threading.Event()
    def wait(self):
        self.entered.set()
        assert self.release.wait(4), 'synthetic boundary watchdog expired'


class FakeStore:
    def __init__(self,runtime,token):self.runtime=runtime;self.token=token
    def allow_request(self,*args):
        if self.runtime.boundary=='rate':self.runtime.gate.wait()
        return True,60
    def close(self):
        runtime=self.runtime
        if runtime.boundary=='close':runtime.gate.wait()
        with runtime.lock:
            runtime.active-=1;runtime.closes+=1
            fail=runtime.fail_close;runtime.fail_close=False
        runtime.close_threads.append(threading.get_ident())
        if fail:raise OSError('synthetic close failure after disposal')


class FakeRuntime(SupabaseRuntime):
    def __init__(self,boundary=None):
        self.boundary=boundary;self.gate=Gate();self.lock=threading.Lock()
        self.active=0;self.maximum=0;self.opens=[];self.closes=0;self.close_threads=[]
        self.fail_open=False;self.fail_close=False;self.fail_logout=False;self.revoked=set()
    def open(self,token=''):
        with self.lock:self.opens.append(token)
        if self.boundary=='open':self.gate.wait()
        if self.fail_open:
            self.fail_open=False
            raise OSError('synthetic open failure')
        if token in self.revoked or token=='invalid':raise StudyError('unauthenticated',401)
        if token=='provider-down':raise StudyError('provider_unavailable',503)
        with self.lock:
            self.active+=1;self.maximum=max(self.maximum,self.active)
        return FakeStore(self,token)
    def principal(self,store):
        if self.boundary=='command':self.gate.wait()
        if not store.token:raise StudyError('unauthenticated',401)
        return Principal('student-own','student')
    def request(self,method,path,*,token=None,**kwargs):
        if self.fail_logout:raise StudyError('provider_unavailable',503)
        self.revoked.add(token)
        return b'{}'


def app_for(tmp_path,runtime,**kwargs):
    return create_app(tmp_path/'unused.sqlite',demo=True,runtime=runtime,request_store_limit=1,request_store_wait=.08,**kwargs)


def test_concurrent_requests_have_one_open_scope_with_two_workers_and_health_bypass(tmp_path):
    import anyio
    runtime=FakeRuntime('command');app=app_for(tmp_path,runtime)
    async def exercise():
        workers=anyio.to_thread.current_default_thread_limiter();old=workers.total_tokens;workers.total_tokens=2
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':'valid'}) as client:
            first=asyncio.create_task(client.get('/study/me'))
            try:
                assert await asyncio.to_thread(runtime.gate.entered.wait,2)
                rest=await asyncio.gather(*[client.get('/study/me') for _ in range(11)],client.post('/study/session',json={'token':'valid'}))
                assert all(response.status_code==503 and response.json()=={'error':'server_busy'} and response.headers['retry-after']=='1' for response in rest)
                assert (await client.get('/study/health')).status_code==200
                assert runtime.opens==['valid'] and runtime.maximum==1 and runtime.active==1
            finally:
                runtime.gate.release.set();await first;workers.total_tokens=old
            assert runtime.active==0
    asyncio.run(exercise())


def test_cancelled_queued_request_does_not_steal_the_released_permit(tmp_path):
    runtime=FakeRuntime('command')
    app=create_app(tmp_path/'unused.sqlite',demo=True,runtime=runtime,request_store_limit=1,request_store_wait=1)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':'valid'}) as client:
            first=asyncio.create_task(client.get('/study/me'))
            assert await asyncio.to_thread(runtime.gate.entered.wait,2)
            queued=asyncio.create_task(client.get('/study/me'))
            try:
                await asyncio.sleep(.03)
                assert not queued.done() and runtime.opens==['valid']
                queued.cancel()
                with pytest.raises(asyncio.CancelledError):await queued
                following=asyncio.create_task(client.get('/study/me'))
                await asyncio.sleep(.02)
                assert runtime.opens==['valid']
                runtime.gate.release.set()
                assert (await first).status_code==200 and (await following).status_code==200
            finally:
                runtime.gate.release.set()
                await asyncio.gather(first,queued,return_exceptions=True)
            assert runtime.active==0 and runtime.maximum==1 and runtime.closes==2
    asyncio.run(exercise())


@pytest.mark.parametrize('failure',['open','close'])
def test_open_and_close_failures_return_the_admission_permit(tmp_path,failure):
    runtime=FakeRuntime();setattr(runtime,'fail_'+failure,True);app=app_for(tmp_path,runtime)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app,raise_app_exceptions=False),base_url='http://testserver',cookies={'study_session':'valid'}) as client:
            failed=await client.get('/study/me')
            if failure=='open':assert failed.status_code==503
            assert (await client.get('/study/me')).status_code==200
            assert runtime.maximum==1 and runtime.active==0
    asyncio.run(exercise())


@pytest.mark.parametrize('boundary,counter',[('open',False),('command',False),('close',False),('rate',True),('open',True),('close',True)])
def test_cancelled_active_scope_keeps_permit_until_worker_cleanup_and_then_reuses_it(tmp_path,boundary,counter):
    runtime=FakeRuntime(boundary);app=app_for(tmp_path,runtime);loop_thread=threading.get_ident()
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':'valid'}) as client:
            pending=asyncio.create_task(client.post('/study/session',json={'token':'valid'}) if counter else client.get('/study/me'))
            try:
                assert await asyncio.to_thread(runtime.gate.entered.wait,2)
                pending.cancel()
                await asyncio.sleep(.03)
                assert (await client.get('/study/health')).status_code==200
                overflow=await client.get('/study/me')
                assert overflow.status_code==503 and runtime.opens==([''] if counter else ['valid'])
            finally:
                runtime.gate.release.set()
                with pytest.raises(asyncio.CancelledError):await pending
            assert (await client.get('/study/me')).status_code==200
            assert runtime.maximum==1 and runtime.active==0
            assert runtime.close_threads and all(thread!=loop_thread for thread in runtime.close_threads)
    asyncio.run(exercise())


def test_login_reuses_one_store_and_rate_counter_releases_before_session_scope(tmp_path):
    runtime=FakeRuntime();app=app_for(tmp_path,runtime)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':'invalid'}) as client:
            response=await client.post('/study/session',json={'token':'valid'})
            assert response.status_code==200 and response.json()['id']=='student-own'
            assert runtime.opens==['','valid'] and runtime.maximum==1 and runtime.active==0
            assert (await client.get('/study/me')).status_code==200
    asyncio.run(exercise())


@pytest.mark.parametrize('token,fail_logout,expected',[('valid',False,{'ok':True}),('invalid',False,{'ok':True}),('provider-down',False,{'ok':True,'serverRevocation':'UNCONFIRMED'}),('valid',True,{'ok':True,'serverRevocation':'UNCONFIRMED'})])
def test_logout_auth_recovery_and_provider_failure_with_one_scope(tmp_path,token,fail_logout,expected):
    runtime=FakeRuntime();runtime.fail_logout=fail_logout;app=app_for(tmp_path,runtime)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':token}) as client:
            response=await client.delete('/study/session')
            assert response.status_code==200 and response.json()==expected
            assert 'Max-Age=0' in response.headers['set-cookie']
            assert runtime.opens==['',token] and runtime.maximum<=1 and runtime.active==0
            if token=='valid' and not fail_logout:
                assert (await client.get('/study/me',headers={'Cookie':'study_session=valid'})).status_code==401
    asyncio.run(exercise())


@pytest.mark.parametrize('configuration',[{'request_store_limit':0},{'request_store_limit':True},{'request_store_limit':1025},{'request_store_wait':0},{'request_store_wait':True},{'request_store_wait':float('inf')},{'request_store_wait':10**1000}])
def test_admission_configuration_is_validated_before_runtime_use(tmp_path,configuration):
    runtime=FakeRuntime()
    with pytest.raises(ValueError,match='invalid_store_admission'):
        create_app(tmp_path/'unused.sqlite',demo=True,runtime=runtime,**configuration)
    assert not runtime.opens


def test_revoke_all_reuses_authenticated_store_and_compat_exchange_still_works(tmp_path):
    runtime=FakeRuntime();app=app_for(tmp_path,runtime)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver',cookies={'study_session':'valid'}) as client:
            response=await client.post('/study/session/revoke-all')
            assert response.status_code==200 and response.json()=={'revoked':True}
            assert runtime.opens==['valid'] and runtime.maximum==1 and runtime.active==0
            assert 'valid' in runtime.revoked
    asyncio.run(exercise())
    assert runtime.exchange('direct').id=='student-own'
    runtime.sign_out('direct')
    assert runtime.active==0 and runtime.maximum==1 and 'direct' in runtime.revoked


def test_login_body_cannot_supply_role_and_saturated_logout_clears_cookie(tmp_path):
    runtime=FakeRuntime();app=app_for(tmp_path,runtime)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://testserver') as client:
            response=await client.post('/study/session',json={'token':'valid','role':'teacher','actorId':'tutor-other'})
            assert response.status_code==200 and response.json()['role']=='student'
            runtime.boundary='command'
            first=asyncio.create_task(client.get('/study/me'))
            try:
                assert await asyncio.to_thread(runtime.gate.entered.wait,2)
                response=await client.delete('/study/session')
                assert response.status_code==503 and response.json()['serverRevocation']=='UNCONFIRMED'
                assert response.json()['error']=='server_busy' and response.headers['retry-after']=='1'
                assert 'Max-Age=0' in response.headers['set-cookie']
            finally:
                runtime.gate.release.set();await first
            assert runtime.active==0 and runtime.maximum==1
    asyncio.run(exercise())
