"""Deferred real Auth/RLS contract; requires root authorization and opt-in env.

No migration added for listing. Default unit runs skip before any connection.
"""
import uuid
import pytest
from test_postgres_contract import pg_configuration, pg_store, identities, api_request
from lessonos.study.models import StudyError


def test_postgres_discovery_scopes_authenticated_teacher_and_members_before_decode(pg_store,pg_configuration,identities,tmp_path):
    from lessonos.study.postgres import PostgresStudyStore
    actors,sessions=identities
    teacher,student,peer,edition=actors
    analysis=edition+'-analysis';waiting=edition+'-waiting';foreign=edition+'-foreign'
    other=pg_store.create_principal('tutor-list-'+uuid.uuid4().hex[:12],'teacher')
    pg_store.create_edition(teacher,analysis,course_id='analisi-1',pack_id='taylor-exp-v1')
    pg_store.add_test_member(teacher,analysis,student.id)
    pg_store.create_edition(teacher,waiting)
    pg_store.connection.execute('INSERT INTO study_waitlist VALUES(?,?)',(waiting,student.id))
    pg_store.create_edition(other,foreign)
    pg_store.add_test_member(other,foreign,peer.id)
    expected=(sorted([edition,analysis,waiting]),sorted([edition,analysis]),sorted([edition,foreign]))
    for session,actor,visible in zip(sessions,actors[:3],expected):
        store=PostgresStudyStore(pg_configuration['DB_URL'],tmp_path,
            auth_user_id=session['userId'],auth_session_id=session['sessionId'])
        try:
            found=[];after=None
            while True:
                page=store.list_editions(actor,limit=1,after=after)
                found.extend(item['id'] for item in page['items'])
                if page['nextCursor'] is None:break
                after=page['nextCursor']
            assert found==visible
            assert all(item==store.get_edition(item['id']) for item in store.list_editions(actor)['items'])
        finally:store.close()
    # Malformed unrelated JSON cannot enter the teacher's bounded decoder.
    pg_store.connection.execute("UPDATE study_editions SET sessions='malformed-json' WHERE id=?",(foreign,))
    session=sessions[0]
    store=PostgresStudyStore(pg_configuration['DB_URL'],tmp_path,
        auth_user_id=session['userId'],auth_session_id=session['sessionId'])
    try:assert [item['id'] for item in store.list_editions(teacher)['items']]==expected[0]
    finally:store.close()
    status,_=api_request(pg_configuration,'GET','/rest/v1/study_editions?select=id',token=sessions[1]['token'])
    assert status in (401,403), 'browser must not gain an alternate catalog authority'
    # RLS session liveness still gates the shared helper after Auth revocation.
    status,_=api_request(pg_configuration,'DELETE','/auth/v1/admin/users/'+sessions[1]['userId'],admin=True)
    assert status==200
    store=PostgresStudyStore(pg_configuration['DB_URL'],tmp_path,
        auth_user_id=sessions[1]['userId'],auth_session_id=sessions[1]['sessionId'])
    try:
        with pytest.raises(StudyError,match='unauthenticated'):store.list_editions(student)
    finally:store.close()
