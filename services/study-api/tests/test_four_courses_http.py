from fastapi.testclient import TestClient
from study_api.app import create_app
from test_identity import setup_store
from lessonos.study.four_courses import PATHS
import pytest

@pytest.mark.parametrize('path',PATHS)
def test_course_content_is_edition_authorized_and_receipts_use_same_core(tmp_path,path):
 store,tutor,student,peer,other=setup_store(tmp_path)
 store.create_edition(tutor,'new-course',course_id=path,pack_id='sf-'+path+'-v1',pack_version=1)
 store.add_test_member(tutor,'new-course',student.id)
 with TestClient(create_app(store.path,demo=True)) as client:
  assert client.get('/study/course-learning?editionId=new-course').status_code==401
  assert client.get('/study/coursepack?editionId=new-course').status_code==401
  client.post('/study/session',json={'token':store.issue_session(peer)})
  assert client.get('/study/course-learning?editionId=new-course').status_code==403
  token=store.issue_session(student)
  client.post('/study/session',json={'token':token})
  r=client.get('/study/course-learning?editionId=new-course');assert r.status_code==200,r.text
  course=r.json()['course']
  assert course['editorialMaterials'] is None
  assert all(l['releaseScope']=='PUBLIC_DEMONSTRATION' for l in course['lessons'])
  student_pack=client.get('/study/coursepack?editionId=new-course').json()
  assert 'atomicFinalAssessment' not in student_pack and 'diagnostic' not in student_pack
  assert all(l['releaseScope']=='PUBLIC_DEMONSTRATION' for l in student_pack['lessons'])
  assert course['pathId']==path and course['completedObjectives']==0
  lesson=next(l for l in course['lessons'] if l.get('activityId'))
  assert lesson['modelCases'] and lesson['lessonRef']['sha256']
  body={'editionId':'new-course','activityId':lesson['activityId'],'activityParameters':lesson['practice']['parameters'],'text':'Previsione ragionata sintetica.'}
  response=client.post('/study/submissions',json=body,headers={'Idempotency-Key':'four-course-attempt'})
  assert response.status_code==200,response.text
  retry=client.post('/study/submissions',json=body,headers={'Idempotency-Key':'four-course-attempt'})
  assert retry.status_code==200 and retry.json()==response.json()
  assert response.json()['courseContext']['packId']==course['packId']
  store.revoke_all_sessions(student)
  assert client.get('/study/course-learning?editionId=new-course').status_code==401
  assert client.post('/study/submissions',json=body,headers={'Idempotency-Key':'revoked'}).status_code==401
  client.post('/study/session',json={'token':store.issue_session(tutor)})
  teacher_course=client.get('/study/course-learning?editionId=new-course').json()['course']
  assert teacher_course['editorialMaterials']['atomicFinalAssessment']
  assert any(l['releaseScope']=='PRIVATE_EDITORIAL_REVIEW' for l in teacher_course['lessons'])
  teacher_pack=client.get('/study/coursepack?editionId=new-course').json()
  assert teacher_pack['atomicFinalAssessment']
  client.post('/study/session',json={'token':store.issue_session(other)})
  assert client.get('/study/course-learning?editionId=new-course').status_code==403
 store.connection.close()
