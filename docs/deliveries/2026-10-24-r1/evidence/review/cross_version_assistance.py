import sys,json,tempfile,threading
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent;sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study.learning_experiences import list_experiences
checks=[];records=[]
def mark(name,pass_,detail=None):checks.append({'name':name,'pass':bool(pass_),'detail':detail})
def evidence(version='v2',step='fixed-flow',ratio=.0625,boundary='flow'):return {'schemaVersion':1,'experienceId':'poiseuille-boundary-'+version,'stepId':step,'prediction':{'ratio':ratio,'fixedQuantity':boundary},'supportUsed':[]}
def send(s,actor,key,version='v2',edition='fluidi',step='fixed-flow',params=None,ratio=.0625,boundary='flow'):
 r=submit(s,actor,edition,'poiseuille-v1',[],'Procedimento indipendente sintetico',key,activity_parameters=params or {'radiusRatio':2,'boundary':'flow'},activity_evidence=evidence(version,step,ratio,boundary));e=r['activityEvidence'];records.append({'key':key,'version':version,'edition':edition,'step':step,'assistance':e['assistance'],'support':e['supportUsed'],'ratio':e['result']['ratio']});return r
with tempfile.TemporaryDirectory(dir=OUT,prefix='cross-version-')as folder:
 path=Path(folder)/'study.sqlite';s=StudyStore(path);teacher=s.create_principal('independent-tutor','teacher');a=s.create_principal('independent-student-a','student');b=s.create_principal('independent-student-b','student');c=s.create_principal('independent-student-c','student')
 for ed in ['fluidi','other-edition']:
  s.create_edition(teacher,ed,capacity=10)
  for actor in [a,b,c]:s.add_test_member(teacher,ed,actor.id)
 first=send(s,a,'original-v1',version='v1');second=send(s,a,'new-v2');mark('v1 exact result remains available in v2',first['activityEvidence']['assistance']=='NO_SUPPORT_REQUESTED' and second['activityEvidence']['assistance']=='SUPPORT_REQUESTED' and 'model-result'in second['activityEvidence']['supportUsed'])
 mark('idempotent original receipt unchanged after newer version',send(s,a,'original-v1',version='v1')==first)
 peer=send(s,b,'peer-first');mark('peer has no other actor assistance',peer['activityEvidence']['assistance']=='NO_SUPPORT_REQUESTED')
 other=send(s,a,'edition-first',edition='other-edition');mark('edition isolation retains independent availability',other['activityEvidence']['assistance']=='NO_SUPPORT_REQUESTED')
 pressure=send(s,a,'pressure-first',step='fixed-pressure',params={'radiusRatio':2,'boundary':'pressure'},ratio=16,boundary='pressure');mark('different boundary is a distinct model result',pressure['activityEvidence']['assistance']=='NO_SUPPORT_REQUESTED')
 transfer=send(s,a,'transfer-a',step='transfer',params={'radiusRatio':1,'viscosity':2,'length':2,'boundary':'flow'},ratio=4);mark('new transfer uses actual viscosity and length, remains separate',transfer['activityEvidence']['result']['ratio']==4 and transfer['activityEvidence']['assistance']=='NO_SUPPORT_REQUESTED')
 listed=list_experiences(s,a,'fluidi');mark('v2 defaults first and both v1 variants remain resolvable',[e['id']for e in listed['experiences']]==['poiseuille-boundary-v2','poiseuille-nearby-v2','poiseuille-boundary-v1','poiseuille-nearby-v1'])
 s.close();barrier=threading.Barrier(2);locks=[];mutex=threading.Lock()
 def worker(version):
  w=StudyStore(path);original=w.lock_aggregate
  def lock(conn,namespace,key):
   if namespace=='learning.model-result':
    with mutex:locks.append({'version':version,'namespace':namespace,'key':key})
   return original(conn,namespace,key)
  w.lock_aggregate=lock
  try:barrier.wait(timeout=5);return send(w,c,'concurrent-'+version,version=version)['activityEvidence']['assistance']
  finally:w.close()
 with ThreadPoolExecutor(max_workers=2)as executor:results=list(executor.map(worker,['v1','v2']))
 mark('simultaneous cross-version submissions linearize exactly one first result',sorted(results)==['NO_SUPPORT_REQUESTED','SUPPORT_REQUESTED'],results)
 mark('canonical aggregate lock key matches across versions',len(locks)==2 and locks[0]['key']==locks[1]['key'],locks)
result={'checks':checks,'receipts':records,'scope':'real local SQLite independent fixture, separate connections and concurrent threads; shared canonical lock-key request inspected; remote Postgres concurrency NOT_RUN','humanApproval':'PENDING'};(OUT/'cross-version-assistance.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert all(x['pass']for x in checks)
