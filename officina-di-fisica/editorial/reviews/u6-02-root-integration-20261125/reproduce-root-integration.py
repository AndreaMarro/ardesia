import fcntl,json,hashlib,subprocess,os,time,re,sys,importlib
from pathlib import Path
APP=Path.cwd();sys.path.insert(0,str(APP));OUT=APP/'editorial/reviews/u6-02-root-integration-20261125';OUT.mkdir(exist_ok=True)
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
recovery=json.loads((APP/'editorial/reviews/u6-02-root-recovery-pending-20261125.json').read_text())
guard=json.loads((APP/'editorial/reviews/u6-circuits-200-204-domain-guard-20261125/handoff.json').read_text())
checks={key.removeprefix('officina-di-fisica/'):row['sha256'] for key,row in recovery['files'].items()}
checks.update(guard['files'])
def verify_all():
 for rel,pin in checks.items():assert sha((APP/rel).read_bytes())==pin,rel
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 import shutil
 assert shutil.disk_usage('/private/tmp').free>2*1024**3
 verify_all();runtime=runtime_fingerprint(APP);testresults=[]
 env={**os.environ,'PYTHONPATH':'.','PYTHONDONTWRITEBYTECODE':'1'};env.pop('CRIC_REVIEW_CANDIDATE_APP',None)
 for pattern,expected in [('test_u6_circuits_200_204_independent.py',16),('test_cross_review_circuits_205_209.py',14)]:
  started=time.monotonic();run=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p',pattern,'-v'],cwd=APP,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=120)
  name=pattern.removesuffix('.py')+'.txt';(OUT/name).write_text(run.stdout);print(run.stdout[-160:],flush=True)
  assert run.returncode==0;match=re.search(r'Ran (\d+) tests in ([0-9.]+)s',run.stdout);assert match and int(match[1])==expected
  testresults.append({'testFile':pattern,'count':int(match[1]),'testSeconds':float(match[2]),'wallSeconds':round(time.monotonic()-started,3),'observedExitCode':run.returncode,'logSha256':sha((OUT/name).read_bytes())})
 assign=json.loads((APP/'editorial/assignments/u6-02-v1.json').read_text());imports=[];ids=[]
 for spec in assign['assignments']:
  batch=spec['batchId'];module=importlib.import_module('tools.corpus_engineering.'+batch.rsplit('-',1)[0].replace('-','_')+'_verifier')
  p=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text());b=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_text())
  # Deliberately use canonical Root files and assets, never a test fixture fallback.
  assert digest(p)==module.REVIEWED_PACKAGE_SHA256 and digest(b)==module.REVIEWED_BINDINGS_SHA256
  fresh=module.report(p,b,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text());assert fresh==saved
  assert_record_identity(fresh['records'],set(spec['questionIds']),p,b);assert all(row['ok']is True for row in fresh['records'])
  assert len(fresh['records'])==16;ids.extend(row['id']for row in fresh['records'])
  integration=exercise(batch);assert (integration['firstImport']['saved'],integration['repeatedImport']['saved'],integration['repeatedImport']['unchanged'])==(16,0,16)
  assert integration['beforePublishedCount']==integration['afterPublishedCount']==991
  (APP/'editorial/reviews'/f'{batch}-integration.json').write_text(canonical(integration)+'\n')
  imports.append({'batchId':batch,'questionIds':spec['questionIds'],'firstSaved':16,'repeatSaved':0,'repeatUnchanged':16,'published991BytesUnchanged':integration['beforePublishedSha256']==integration['afterPublishedSha256'],'reportSha256':sha((APP/'editorial/reviews'/f'{batch}.json').read_bytes()),'integrationSha256':sha((APP/'editorial/reviews'/f'{batch}-integration.json').read_bytes())})
 assert len(ids)==len(set(ids))==160;verify_all();assert runtime==runtime_fingerprint(APP)
 receipt={'schemaVersion':'1.0.0','scope':'Root verification of separately authored and source-first independently solved U6-02, actual final canonical files without fixture fallbacks','scientificRecordsAccepted':160,'scientificallyReviewedQuestions':3152,'scientificallyUnreviewedQuestions':1454,'compiledCheckpointQuestionDrafts':2992,'independentHandoffs':{'A205_209':'4e5aeee85aa82765aec37d22fb72b30c6caa74750d92a5cc57a21fe05c959736','B200_204':'10ba795c7e999f0ba672491ce00ea9837c6df5d72116dd6232e1bd6b1237ad5b','B200_204_guard_followup':'75762a98b796b9af1e61ac58698a0bc2adefc37806fa0638c4e678f78d7265e4'},'rootTests':testresults,'imports':imports,'filesVerifiedBeforeAndAfter':checks,'runtimeFingerprint':runtime,'newProductUI':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE','uploads':False}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items()if k not in ['filesVerifiedBeforeAndAfter','runtimeFingerprint','imports']}),flush=True)
