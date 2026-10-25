"""Synthetic local HTTP workflow: same Core, four editions, cold reopen.

Run from repository root with PYTHONPATH=packages/engine:services/study-api.
No remote service, human approval, enrollment/payment or real user is simulated
as an accomplished production action. Private draft feedback stays private until
an explicit synthetic tutor review command.
"""
import json
import tempfile
from contextlib import ExitStack
from pathlib import Path
from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from lessonos.study.four_courses import PATHS
from study_api.app import create_app

report={'syntheticOnly':True,'remote':False,'humanScientificApproval':False,'courses':[]}
with tempfile.TemporaryDirectory(prefix='ardesia-four-workflow-') as directory:
 db=Path(directory)/'study.sqlite';store=StudyStore(db)
 tutor=store.create_principal('four-flow-tutor','teacher')
 student=store.create_principal('four-flow-student','student')
 peer=store.create_principal('four-flow-peer','student')
 other=store.create_principal('four-flow-other','teacher')
 
 def login(client,p):
  issuer=StudyStore(db);token=issuer.issue_session(p);issuer.close()
  response=client.post('/study/session',json={'token':token});assert response.status_code==200,(response.status_code,response.text)
 with ExitStack() as stack:
  app=create_app(db,demo=True)
  clients={p.id:stack.enter_context(TestClient(app)) for p in (tutor,student,peer,other)}
  for p in (tutor,student,peer,other):login(clients[p.id],p)
  for path in PATHS:
   eid='flow-'+path;store.create_edition(tutor,eid,course_id=path,pack_id='sf-'+path+'-v1',pack_version=1);store.add_test_member(tutor,eid,student.id)
   client=clients[student.id]
   course=client.get('/study/course-learning',params={'editionId':eid}).json()['course']
   assert course['editorialMaterials'] is None and course['completedObjectives']==0
   row={'pathId':path,'models':[]};report['courses'].append(row)
   for lesson in course['lessons']:
    activity=lesson['activityId'];base={'editionId':eid,'activityId':activity,'text':'Previsione e ragionamento sintetici; nessuna autonomia attestata.'}
    body={**base,'activityParameters':lesson['practice']['parameters']}
    key=eid+'-'+activity
    reply=client.post('/study/submissions',json=body,headers={'Idempotency-Key':key});assert reply.status_code==200,reply.text
    receipt=reply.json();assert receipt['courseContext']['packSha256']==course['packRef']['packSha256']
    assert client.post('/study/submissions',json=body,headers={'Idempotency-Key':key}).json()==receipt
    client=clients[tutor.id]
    proposal=client.post('/study/feedback/drafts',json={'submissionId':receipt['submissionId']});assert proposal.status_code==200,proposal.text
    draft=proposal.json()
    client=clients[student.id]
    workspace=client.get('/study/workspace',params={'editionId':eid}).json()
    first=next(s for s in workspace['submissions'] if s['id']==receipt['submissionId']);assert first['feedback']==[]
    client=clients[tutor.id]
    pub=client.post('/study/feedback/'+draft['id']+'/publish',json={'expectedRevision':draft['submissionRevision'],'text':'Revisione sintetica esplicita: controlla unità, modello e vincolo. Affronta ora il caso diverso.','decision':'returned'},headers={'Idempotency-Key':'review-'+key})
    assert pub.status_code==200 and pub.json()['syntheticTutor'] is True,pub.text
    client=clients[student.id]
    workspace=client.get('/study/workspace',params={'editionId':eid}).json()
    first=next(s for s in workspace['submissions'] if s['id']==receipt['submissionId']);assert first['feedback'][0]['review']['decision']=='returned'
    transfer={**base,'activityParameters':lesson['transfer']['parameters'],'parentId':receipt['submissionId']}
    reply=client.post('/study/submissions',json=transfer,headers={'Idempotency-Key':'transfer-'+key});assert reply.status_code==200,reply.text
    transfer_receipt=reply.json();assert transfer_receipt['revision']==2
    for actor in (peer,other):
     client=clients[actor.id]
     assert client.get('/study/receipts/'+receipt['receiptId']).status_code==403
    client=clients[tutor.id]
    workspace=client.get('/study/workspace',params={'editionId':eid}).json()
    assert any(s['id']==transfer_receipt['submissionId'] for s in workspace['submissions'])
    client=clients[student.id]
    row['models'].append({'activityId':activity,'receiptRetry':True,'draftHidden':True,'explicitSyntheticReview':True,'changedTransferRevision':2,'peerAndOtherTeacherDenied':True})
 store.close()
 with TestClient(create_app(db,demo=True)) as client:
  login(client,tutor)
  for row in report['courses']:
   response=client.get('/study/workspace',params={'editionId':'flow-'+row['pathId']});assert response.status_code==200
   assert len(response.json()['submissions'])==2*len(row['models'])
   row['coldTeacherReopen']=True
  login(client,student)
  fresh=StudyStore(db);fresh.revoke_all_sessions(student);fresh.close()
  assert client.get('/study/course-learning',params={'editionId':'flow-'+PATHS[0]}).status_code==401
 report['coldReopen']=True;report['revocation']=True
 report['independentStoresSameDatabase']=True
report['status']='PASS'
print(json.dumps(report,indent=2))
