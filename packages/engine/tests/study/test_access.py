import concurrent.futures
import pytest
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def test_invitation_is_single_use_persistent_and_scoped(tmp_path):
    store,tutor,student,peer,other=setup_store(tmp_path)
    for unauthorized in (student,other):
        with pytest.raises(StudyError):store.create_invitation(unauthorized,'fluidi',peer.id)
    invite=store.create_invitation(tutor,'fluidi',student.id,ttl=60)
    assert invite['token'] not in store.path.read_bytes().decode('latin1')
    reopened=StudyStore(store.path)
    token=reopened.accept_invitation(invite['token'])
    assert reopened.principal_for_session(token)==student
    with pytest.raises(StudyError,match='invalid_invitation'):store.accept_invitation(invite['token'])


def test_invitation_expiry_revocation_and_concurrent_exchange(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    store.clock=lambda:100
    expired=store.create_invitation(tutor,'fluidi',student.id,ttl=10)
    store.clock=lambda:110
    with pytest.raises(StudyError,match='invalid_invitation'):store.accept_invitation(expired['token'])
    revoked=store.create_invitation(tutor,'fluidi',student.id)
    store.revoke_invitation(tutor,revoked['id'])
    with pytest.raises(StudyError):store.accept_invitation(revoked['token'])
    store.clock=__import__('time').time
    invite=store.create_invitation(tutor,'fluidi',student.id)
    def exchange(_):
        connection=StudyStore(store.path)
        try:
            return bool(connection.accept_invitation(invite['token']))
        except StudyError:return False
        finally:connection.close()
    with concurrent.futures.ThreadPoolExecutor(2) as pool:assert sorted(pool.map(exchange,range(2)))==[False,True]
    token=store.issue_session(student)
    store.revoke_all_sessions(student)
    assert store.principal_for_session(token) is None
