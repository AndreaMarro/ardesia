"""Authenticated edition discovery has no caller-selected actor authority."""
import pytest
from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store


@pytest.fixture
def listing(tmp_path):
    store,teacher,student,peer,other=setup_store(tmp_path)
    store.create_edition(teacher,'analysis',course_id='analisi-1',pack_id='taylor-exp-v1')
    store.add_test_member(teacher,'analysis',student.id)
    store.create_edition(other,'private-other')
    store.add_test_member(other,'private-other',peer.id)
    store.create_edition(teacher,'waiting')
    with store.transaction() as c:c.execute('INSERT INTO study_waitlist VALUES(?,?)',('waiting',student.id))
    yield store,teacher,student,peer,other
    store.close()


@pytest.mark.parametrize('role,expected',[('teacher',['analysis','fluidi','waiting']),('student',['analysis','fluidi']),('peer',['fluidi','private-other'])])
def test_authenticated_editions_roundtrip_membership_and_pack_descriptors(listing,role,expected):
    store,teacher,student,peer,other=listing
    actor={'teacher':teacher,'student':student,'peer':peer}[role]
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.get('/study/editions').status_code==401
        assert client.post('/study/session',json={'token':store.issue_session(actor)}).status_code==200
        first=client.get('/study/editions',params={'limit':1,'teacherId':other.id,'actorId':other.id})
        assert first.status_code==200 and first.headers['cache-control']=='no-store'
        page=first.json();found=page['items'][:]
        while page['nextCursor'] is not None:
            response=client.get('/study/editions',params={'limit':1,'after':page['nextCursor']})
            assert response.status_code==200
            page=response.json();found.extend(page['items'])
        assert [item['id'] for item in found]==expected
        assert all(item==store.get_edition(item['id']) for item in found)
        assert 'activities' not in first.text and 'source_refs' not in first.text
        if role!='peer':
            assert found[0]['courseId']=='analisi-1' and found[0]['packId']=='taylor-exp-v1'
        assert client.delete('/study/session').status_code==200
        assert client.get('/study/editions').status_code==401


@pytest.mark.parametrize('query',[{'limit':'0'},{'limit':'101'},{'limit':'true'},{'limit':'1.5'},{'limit':str(10**1000)},{'after':''},{'after':'x'*8193}])
def test_http_invalid_page_bounds_are_422_without_loading_editions(listing,query):
    store,teacher,*_=listing
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(teacher)})
        response=client.get('/study/editions',params=query)
        assert response.status_code==422
        assert 'packSha256' not in response.text


def test_revoked_cookie_cannot_discover_even_with_other_actor_query(listing):
    store,teacher,student,peer,other=listing
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(student)})
        store.revoke_session(client.cookies.get('study_session'))
        response=client.get('/study/editions',params={'teacherId':teacher.id,'actorId':peer.id})
        assert response.status_code==401 and response.json()=={'error':'unauthenticated'}


def test_http_legacy_129_cursor_roundtrip_and_new_creation_guard(listing):
    from lessonos.study.models import StudyError
    store,teacher,*_=listing
    legacy='b'*129
    with pytest.raises(StudyError,match='invalid_edition'):store.create_edition(teacher,legacy)
    seed_legacy(store,teacher,legacy)
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(teacher)})
        first=client.get('/study/editions',params={'limit':2})
        assert first.status_code==200
        assert [item['id'] for item in first.json()['items']]==['analysis',legacy]
        assert first.json()['nextCursor']==legacy
        second=client.get('/study/editions',params={'after':first.json()['nextCursor']})
        assert second.status_code==200
        assert [item['id'] for item in second.json()['items']]==['fluidi','waiting']
        assert second.json()['nextCursor'] is None


def seed_legacy(store,teacher,edition):
    with store.transaction() as c:
        c.execute('INSERT INTO classes VALUES(?,?,?)',(edition,teacher.id,'Legacy synthetic'))
        c.execute('INSERT INTO study_editions(id,teacher_id,capacity,price_minor) VALUES(?,?,10,4900)',(edition,teacher.id))
        c.execute("INSERT INTO study_edition_packs SELECT ?,course_id,pack_id,pack_version,pack_sha256 FROM study_edition_packs WHERE edition_id='fluidi'",(edition,))


def test_http_legacy_identifier_beyond_cursor_budget_fails_409_without_partial_page(listing):
    store,teacher,*_=listing
    seed_legacy(store,teacher,'b'*8193)
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(teacher)})
        response=client.get('/study/editions',params={'limit':2})
        assert response.status_code==409
        assert response.json()=={'error':'legacy_edition_identifier_requires_migration'}


def test_exact_discovery_is_membership_scoped_before_decode_and_after_revocation(listing):
    store,teacher,student,peer,other=listing
    with store.transaction() as connection:
        connection.execute("UPDATE study_editions SET sessions='malformed-json' WHERE id='private-other'")
        connection.execute("DELETE FROM study_edition_packs WHERE edition_id='private-other'")
    with TestClient(create_app(store.path,demo=True)) as client:
        assert client.get('/study/editions',params={'editionId':'analysis'}).status_code==401
        client.post('/study/session',json={'token':store.issue_session(student)})
        exact=client.get('/study/editions',params={'editionId':'analysis','limit':1,'actorId':other.id})
        assert exact.status_code==200 and exact.json()=={'items':[store.get_edition('analysis')],'nextCursor':None}
        for unknown in ('missing','private-other','waiting'):
            response=client.get('/study/editions',params={'editionId':unknown,'teacherId':other.id})
            assert response.status_code==200 and response.json()=={'items':[],'nextCursor':None}
        with store.transaction() as connection:
            connection.execute('DELETE FROM study_members WHERE edition_id=? AND student_id=?',('analysis',student.id))
        revoked=client.get('/study/editions',params={'editionId':'analysis'})
        assert revoked.status_code==200 and revoked.json()=={'items':[],'nextCursor':None}


@pytest.mark.parametrize('query',[
    {'editionId':''}, {'editionId':'x'*8193}, {'editionId':'analysis','after':'a'},
])
def test_invalid_exact_discovery_is_422_without_metadata(listing,query):
    store,teacher,*_=listing
    with TestClient(create_app(store.path,demo=True)) as client:
        client.post('/study/session',json={'token':store.issue_session(teacher)})
        response=client.get('/study/editions',params=query)
        assert response.status_code==422 and 'packSha256' not in response.text
