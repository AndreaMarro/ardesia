from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore


def test_public_lab_and_interest_roundtrip(tmp_path):
    store=StudyStore(tmp_path/'db.sqlite'); teacher=store.create_principal('tutor-test','teacher');store.create_edition(teacher,'fluidi')
    token=store.issue_session(teacher)
    with TestClient(create_app(store.path,demo=True)) as client:
        public=client.get('/study/course').json()
        assert public['capacity']==10 and public['priceMinor']==4900
        assert 'teacherId' not in public and 'contact' not in str(public)
        result=client.post('/study/activities/evaluate',json={'activityId':'poiseuille-v1','parameters':{'radiusRatio':1.5,'boundary':'pressure'}})
        assert result.status_code==200 and result.json()['ratio']==5.0625
        body={'contact':'synthetic@example.invalid','topic':'fluidi','slots':['slot-a'],'consent':True}
        receipt=client.post('/study/interests',json=body,headers={'Idempotency-Key':'interest-1'})
        assert receipt.status_code==200 and receipt.json()['status']=='received'
        assert client.post('/study/interests',json=body,headers={'Idempotency-Key':'interest-1'}).json()==receipt.json()
        client.post('/study/session',json={'token':token})
        assert len(client.get('/study/interests?editionId=fluidi').json())==1
