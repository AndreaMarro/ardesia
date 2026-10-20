import pytest
from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore


def client_for(tmp_path):
    store=StudyStore(tmp_path/'db.sqlite');tutor=store.create_principal('tutor','teacher');student=store.create_principal('student','student');store.create_edition(tutor,'fluidi');store.add_test_member(tutor,'fluidi',student.id)
    client=TestClient(create_app(store.path,demo=True));client.post('/study/session',json={'token':store.issue_session(student)})
    return client

@pytest.mark.parametrize('path,body',[
 ('/study/activities/evaluate',{'activityId':'poiseuille-v1','parameters':[]}),
 ('/study/submissions',{'editionId':'fluidi','activityId':'poiseuille-v1','text':'x','assetRefs':[{}]}),
 ('/study/submissions',{'editionId':'fluidi','activityId':'poiseuille-v1','text':'x','sourceRefs':[{}]}),
 ('/study/interests',{'contact':123,'topic':'fluidi','slots':['a'],'consent':True}),
])
def test_malformed_payloads_fail_closed_as_client_errors(tmp_path,path,body):
    with client_for(tmp_path) as client:
        response=client.post(path,json=body,headers={'Idempotency-Key':'key'})
        assert response.status_code==422


def test_http_commit_failure_never_claims_success(tmp_path):
    with client_for(tmp_path) as client:
        store=StudyStore(tmp_path/'db.sqlite')
        store.connection.execute("CREATE TRIGGER fail_receipt BEFORE INSERT ON study_receipts BEGIN SELECT RAISE(ABORT,'synthetic full'); END");store.connection.commit()
        response=client.post('/study/submissions',json={'editionId':'fluidi','activityId':'poiseuille-v1','text':'x'},headers={'Idempotency-Key':'key'})
        assert response.status_code==503 and response.json()=={'error':'storage_unavailable'}
        assert store.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]==0
