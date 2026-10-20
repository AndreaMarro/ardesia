"""HTTP cookie recovery: real local Core; explicitly fake Supabase boundaries."""
from http.cookies import SimpleCookie
import pytest
from fastapi.testclient import TestClient
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore,digest
from study_api.app import create_app
from study_api.runtime import SupabaseRuntime


def seed(tmp_path):
    store=StudyStore(tmp_path/'cookie.sqlite')
    teacher=store.create_principal('cookie-tutor','teacher')
    student=store.create_principal('cookie-student','student')
    peer=store.create_principal('cookie-peer','student')
    store.create_edition(teacher,'fluidi')
    store.add_test_member(teacher,'fluidi',student.id)
    store.add_test_member(teacher,'fluidi',peer.id)
    source=store.create_resource(student,'fluidi','notes','PRIVATE COOKIE WITNESS')
    return store,student,peer,source


def assert_deleted(response,secure=False):
    header=response.headers.get('set-cookie','')
    cookie=SimpleCookie();cookie.load(header)
    assert 'study_session' in cookie,header
    value=cookie['study_session']
    assert value.value=='' and value['max-age']=='0' and value['path']=='/'
    assert value['httponly'] and value['samesite']=='strict'
    assert bool(value['secure']) is secure


@pytest.mark.parametrize('secure',[False,True])
@pytest.mark.parametrize('failure',['revoked','expired'])
def test_local_rejected_cookie_is_deleted_without_private_fallback_and_public_recovers(tmp_path,secure,failure):
    store,student,_,source=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True,secure_cookies=secure),base_url='https://testserver' if secure else 'http://testserver') as client:
        assert client.post('/study/session',json={'token':store.issue_session(student)}).status_code==200
        current=client.cookies.get('study_session')
        if failure=='revoked':store.revoke_session(current)
        else:
            with store.transaction() as connection:
                connection.execute('UPDATE study_sessions SET expires_at=0 WHERE token_hash=?',(digest(current),))
        denied=client.get('/study/workspace?editionId=fluidi')
        assert denied.status_code==401 and denied.json()=={'error':'unauthenticated'}
        assert 'PRIVATE COOKIE WITNESS' not in denied.text
        assert_deleted(denied,secure)
        assert client.cookies.get('study_session') is None
        assert client.get('/study/course').status_code==200
        assert client.get('/study/coursepack').status_code==200
        assert client.get('/study/resources/'+source['id']).status_code==401
    store.close()


def test_local_public_entry_itself_can_reject_and_clear_the_cookie(tmp_path):
    store,student,*_=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(student)})
        store.revoke_session(client.cookies.get('study_session'))
        response=client.get('/study/course')
        assert response.status_code==401
        assert_deleted(response)
        assert client.get('/study/course').status_code==200
    store.close()


class FakeSupabaseBoundary(SupabaseRuntime):
    """No Auth/PG/network: exercise runtime.open/principal failure ownership."""
    def __init__(self,path,student,peer):
        self.path=path;self.actors={'valid':student,'peer':peer}
        self.opened=0;self.closed=0;self.active=0;self.attempts=[]
    def open(self,token=''):
        self.attempts.append(token)
        if token in ('rejected-open','invalid-body'):raise StudyError('unauthenticated',401)
        if token=='provider-unavailable':raise StudyError('provider_unavailable',503)
        store=StudyStore(self.path,check_same_thread=False)
        store.boundary_token=token;close=store.close
        self.opened+=1;self.active+=1
        def close_tracked():
            try:close()
            finally:self.closed+=1;self.active-=1
        store.close=close_tracked
        return store
    def principal(self,store):
        actor=self.actors.get(store.boundary_token)
        if actor is None:raise StudyError('unauthenticated',401)
        return store._principal(actor)
    def catalog(self,store,edition_id):
        return {'confirmedTest':store.connection.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?',(edition_id,)).fetchone()[0]}


@pytest.mark.parametrize('token',['rejected-open','rejected-principal'])
def test_explicit_fake_runtime_cookie_failure_before_or_after_open_is_deleted_and_closed(tmp_path,token):
    store,student,peer,_=seed(tmp_path);runtime=FakeSupabaseBoundary(store.path,student,peer)
    with TestClient(create_app(store.path,demo=True,runtime=runtime,request_store_limit=1,request_store_wait=.08)) as client:
        client.cookies.set('study_session',token,domain='testserver.local',path='/')
        denied=client.get('/study/workspace?editionId=fluidi')
        assert denied.status_code==401 and denied.json()=={'error':'unauthenticated'}
        assert_deleted(denied)
        assert client.cookies.get('study_session') is None
        assert runtime.active==0 and runtime.opened==runtime.closed
        assert client.get('/study/course').status_code==200
        assert client.get('/study/workspace?editionId=fluidi').status_code==401
        assert runtime.active==0 and runtime.opened==runtime.closed
    store.close()


def test_real_runtime_token_bound_rejects_cookie_before_any_auth_or_pg_io(tmp_path,monkeypatch):
    runtime=SupabaseRuntime({'API_URL':'http://127.0.0.1:54331','DB_URL':'postgresql://127.0.0.1/unused',
                             'ANON_KEY':'placeholder','SERVICE_ROLE_KEY':'placeholder'},tmp_path)
    def no_network(*args,**kwargs):raise AssertionError('token bound must precede Auth/PG I/O')
    monkeypatch.setattr(runtime,'request',no_network)
    with TestClient(create_app(tmp_path/'unused.sqlite',demo=True,runtime=runtime,request_store_limit=1)) as client:
        client.cookies.set('study_session','x'*8193,domain='testserver.local',path='/')
        denied=client.get('/study/me')
        assert denied.status_code==401 and denied.json()=={'error':'unauthenticated'}
        assert_deleted(denied)
        assert client.cookies.get('study_session') is None


def test_explicit_fake_runtime_provider_failure_does_not_invent_cookie_rejection(tmp_path):
    store,student,peer,_=seed(tmp_path);runtime=FakeSupabaseBoundary(store.path,student,peer)
    with TestClient(create_app(store.path,demo=True,runtime=runtime)) as client:
        client.cookies.set('study_session','provider-unavailable',domain='testserver.local',path='/')
        response=client.get('/study/me')
        assert response.status_code==503 and 'set-cookie' not in response.headers
        assert client.cookies.get('study_session')=='provider-unavailable'
        assert runtime.opened==runtime.closed==runtime.active==0
    store.close()


@pytest.mark.parametrize('backend',['local','explicit_fake_supabase'])
def test_bad_login_body_does_not_delete_an_existing_valid_cookie(tmp_path,backend):
    store,student,peer,_=seed(tmp_path)
    runtime=FakeSupabaseBoundary(store.path,student,peer) if backend!='local' else None
    token='valid' if runtime else store.issue_session(student)
    with TestClient(create_app(store.path,demo=True,runtime=runtime)) as client:
        assert client.post('/study/session',json={'token':token}).status_code==200
        current=client.cookies.get('study_session')
        failed=client.post('/study/session',json={'token':'invalid-body'})
        assert failed.status_code==401 and 'set-cookie' not in failed.headers
        assert client.cookies.get('study_session')==current
        assert client.get('/study/me').json()['id']==student.id
        invalid=client.post('/study/session',json={'token':''})
        assert invalid.status_code==422 and 'set-cookie' not in invalid.headers
        assert client.cookies.get('study_session')==current
        assert client.get('/study/me').status_code==200
        if runtime:assert runtime.active==0 and runtime.opened==runtime.closed
    store.close()


@pytest.mark.parametrize('backend',['local','explicit_fake_supabase'])
def test_absent_cookie_and_valid_peer_denial_do_not_set_deletion_cookies(tmp_path,backend):
    store,student,peer,source=seed(tmp_path)
    runtime=FakeSupabaseBoundary(store.path,student,peer) if backend!='local' else None
    with TestClient(create_app(store.path,demo=True,runtime=runtime)) as client:
        anonymous=client.get('/study/me')
        assert anonymous.status_code==401 and 'set-cookie' not in anonymous.headers
        token='peer' if runtime else store.issue_session(peer)
        client.post('/study/session',json={'token':token})
        current=client.cookies.get('study_session')
        denied=client.get('/study/resources/'+source['id'])
        assert denied.status_code==403 and 'set-cookie' not in denied.headers
        assert 'PRIVATE COOKIE WITNESS' not in denied.text
        assert client.cookies.get('study_session')==current
        assert client.get('/study/me').json()['id']==peer.id
        if runtime:assert runtime.active==0 and runtime.opened==runtime.closed
    store.close()
