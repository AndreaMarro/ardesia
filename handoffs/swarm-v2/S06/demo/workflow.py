"""Synthetic loopback HTTP acceptance, including all six eligible examples.
Run only against this directory's demo database and API; no teacher online."""
import json, os, uuid
from pathlib import Path
import httpx
from lessonos.study.store import StudyStore
from lessonos.study.models import Principal

root=Path(os.environ.get('S06_DEMO_ROOT',str(Path(__file__).parent)))
run=os.environ.get('S06_DEMO_RUN','first')
store=StudyStore(root/('study-'+run+'.sqlite'),initialize=False)
token=store.issue_session(Principal('student-s06-a','student'));store.close()
cases=[
 ('strumenti-meccanica','original-demo-u2-02',.2,.075,'m'),
 ('strumenti-meccanica','original-demo-kinematics',6,-3,'m'),
 ('fluidi-termodinamica','original-demo-u5-01',.02494338785445972,.00831446261815324,'m³'),
 ('elettricita-magnetismo','original-demo-u6-04',1,4.5,'A'),
 ('onde-ottica-radiazioni','original-demo-u4-01',2,1.5,'m'),
 ('analisi-1','taylor-exp-original',1.6458333333333333,.6041666666666666,'1')]
results=[]
with httpx.Client(base_url='http://127.0.0.1:5361',timeout=15) as client:
 def post(path,body,key=None):
  response=client.post('/study'+path,json=body,headers={'Idempotency-Key':key or uuid.uuid4().hex})
  assert response.status_code==200,response.text
  return response.json()
 def get(path):
  response=client.get('/study'+path);assert response.status_code==200,response.text
  return response.json()
 post('/session',{'token':token})
 for edition,lesson_id,practice,transfer,unit in cases:
  item=next(i for i in get('/independent-study?editionId='+edition)['objectives'] if i['lessonRef']['id']==lesson_id)
  state=post('/independent-study',{'editionId':edition,'lessonRef':item['lessonRef']})
  target='/independent-study/'+state['id']
  def action(name,fields=None):
   return post(target+'/actions',{'revisionId':state['revisionId'],'action':name,'fields':fields or {}})
  state=action('diagnostic',{'text':'Controllo i dati, le unità ed il modello originale.'})
  state=action('next');state=action('simulate',{'caseIndex':0})
  assert state['simulation']['result']['unit']==unit
  state=action('next');params=state['task']['parameters'];receipts=[]
  for phase,value in [('practice',practice),('transfer',transfer)]:
   assert state['phase']==phase and 'answer' not in state['task']
   body={'revisionId':state['revisionId'],'answer':{'value':value,'unit':unit,'reasoning':'Procedimento sintetico: dati, relazione e verifica delle unità.'}}
   key=uuid.uuid4().hex;reply=post(target+'/attempts',body,key)
   assert reply['feedback']['numericCorrect'] is True
   assert reply['feedback']['mastery']=='NOT_INFERRED'
   assert post(target+'/attempts',body,key)==reply
   receipts.append(reply['receipt']['receiptId']);state=get(target)
   if phase=='practice':state=action('recover');state=action('next');assert state['task']['parameters']!=params
  state=action('finish');assert state['phase']=='review' and len(state['attempts'])==2
  # A new authenticated cookie session reopens the exact source and receipts.
  s=StudyStore(root/('study-'+run+'.sqlite'),initialize=False);new=s.issue_session(Principal('student-s06-a','student'));s.close()
  with httpx.Client(base_url='http://127.0.0.1:5361',timeout=15) as other:
   assert other.post('/study/session',json={'token':new}).status_code==200
   cold=other.get('/study'+target).json()
   assert cold['sourceRef']==state['sourceRef'] and cold['lessonRef']==item['lessonRef']
   assert [a['receipt']['receiptId'] for a in cold['attempts']]==receipts
  results.append({'edition':edition,'lesson':lesson_id,'attempts':2,'retry':'same receipt','reopen':'exact source','status':'PASS'})
output=Path(os.environ.get('S06_OUTPUTS',str(root/'.artifacts')));output.mkdir(parents=True,exist_ok=True)
(output/'http-workflow-result.json').write_text(json.dumps({'status':'PASS','cases':results},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','lessons':len(results),'confirmedAttempts':sum(r['attempts'] for r in results)}))
