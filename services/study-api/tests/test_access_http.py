from fastapi.testclient import TestClient
from test_identity import setup_store
from study_api.app import create_app


def test_invitation_cookie_revocation_and_payload_limit(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    invite=store.create_invitation(tutor,'fluidi',student.id)
    with TestClient(create_app(store.path,demo=True,secure_cookies=True),base_url='https://localhost') as client:
        response=client.post('/study/invitations/accept',json={'token':invite['token']})
        assert response.status_code==200
        cookie=response.headers['set-cookie'].lower()
        assert all(word in cookie for word in ('secure','httponly','samesite=strict'))
        assert client.get('/study/me').json()['id']==student.id
        assert client.post('/study/invitations/accept',json={'token':invite['token']}).status_code==401
        assert client.post('/study/session/revoke-all').status_code==200
        assert client.get('/study/me').status_code==401
        assert client.post('/study/session',content=b'x'*70000).status_code==413


def test_login_abuse_is_limited_without_blocking_read_only_course(tmp_path):
    store,*_=setup_store(tmp_path)
    with TestClient(create_app(store.path,demo=True,auth_limit=3)) as client:
        for _ in range(3):assert client.post('/study/session',json={'token':'invalid'}).status_code==401
        response=client.post('/study/session',json={'token':'invalid'})
        assert response.status_code==429 and int(response.headers['retry-after'])>0
        assert client.get('/study/course').status_code==200


def test_tutor_can_manage_only_own_member_invites_and_ops_health(tmp_path):
    store,tutor,student,peer,other=setup_store(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(student)})
        assert client.get('/study/editions/fluidi/access').status_code==403
        assert client.get('/study/ops/health').status_code==403
        client.post('/study/session',json={'token':store.issue_session(tutor)})
        listing=client.get('/study/editions/fluidi/access')
        assert listing.status_code==200 and len(listing.json()['members'])==2
        invitation=client.post('/study/editions/fluidi/invitations',json={'actorId':student.id}).json()
        result=client.get('/study/editions/fluidi/access').json()
        assert invitation['token'] not in str(result)
        assert result['invitations'][0]['state']=='pending'
        assert client.delete('/study/invitations/'+invitation['id']).status_code==200
        assert client.get('/study/ops/health').json()['ok'] is True
        client.post('/study/session',json={'token':store.issue_session(other)})
        assert client.get('/study/editions/fluidi/access').status_code==403
