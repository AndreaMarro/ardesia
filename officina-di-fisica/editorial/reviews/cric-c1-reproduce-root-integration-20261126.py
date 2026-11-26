"""Replay distinct C1 reviews and import remaining90 through the existing importer."""
import fcntl,hashlib,importlib,json,os,re,shutil,subprocess,sys
from pathlib import Path
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();OUT=APP/'editorial/reviews/cric-c1-remaining90-root-integration-20261126';OUT.mkdir(exist_ok=True)
recovery=json.loads((APP/'editorial/reviews/cric-c1-100-root-recovery-20261126.json').read_text())
def check():
 for path,info in recovery['files'].items():assert hashlib.sha256((APP/path).read_bytes()).hexdigest()==info['sha256'],path
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>2*1024**3;check();runtime=runtime_fingerprint(APP)
 env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1');env.pop('CRIC_REVIEW_CANDIDATE_APP',None);tests=[]
 patterns=[f'test_cric_c1_l{i:03d}_independent.py'for i in range(2,6)]+['test_cross_review_cric_c1_l006_l010_a.py']
 for pattern in patterns:
  assert 'tests/corpus/'+pattern in recovery['files'],pattern
  result=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p',pattern,'-v'],cwd=APP,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=240)
  log=OUT/('root-'+pattern+'.txt');log.write_bytes(result.stdout);print(pattern,result.returncode,result.stdout.decode()[-200:],flush=True);assert result.returncode==0
  match=re.search(rb'Ran (\d+) tests in ([0-9.]+)s',result.stdout);assert match and int(match[1])>0
  tests.append({'pattern':pattern,'count':int(match[1]),'seconds':float(match[2]),'actualExitCode':0,'logSha256':hashlib.sha256(result.stdout).hexdigest()})
 imports=[]
 for spec in json.loads((APP/'editorial/assignments/cric-606-v1.json').read_text())['assignments']:
  batch=spec['batchId']
  if not batch.startswith('cric-c1-')or batch=='cric-c1-l001':continue
  module=importlib.import_module('tools.corpus_engineering.'+batch.replace('-','_')+'_verifier')
  package=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text());bindings=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_text())
  actual=module.report(package,bindings,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text());assert actual==saved,batch
  assert_record_identity(actual['records'],set(spec['questionIds']),package,bindings)
  result=exercise(batch);assert(result['firstImport']['saved'],result['repeatedImport']['saved'],result['repeatedImport']['unchanged'])==(10,0,10)
  assert result['beforePublishedCount']==result['afterPublishedCount']==991 and result['beforePublishedSha256']==result['afterPublishedSha256']
  assert result['preservedLiveHeads']==10
  target=APP/'editorial/reviews'/f'{batch}-integration.json';target.write_text(canonical(result)+'\n')
  imports.append({'batch':batch,'questionIds':spec['questionIds'],'integrationSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'firstSaved':10,'repeatSaved':0,'repeatUnchanged':10,'preservedLiveHeads':10});print('Canonical import',batch,'10→0/10',flush=True)
 check();assert runtime==runtime_fingerprint(APP);ids=[q for row in imports for q in row['questionIds']];assert len(ids)==len(set(ids))==90
 receipt={'scope':'Root actual gates on90 final Cric editions, distinct A/B authors and crossed peer reviews; first10 not counted twice','scientificRecordsAccepted':90,'scientificallyReviewedQuestions':4100,'scientificallyUnreviewedQuestions':506,'registeredQuestionDrafts':3792,'registrationPendingQuestions':308,'compiledOfficialQuestionDrafts':3632,'runtimeSha256':runtime['sha256'],'rootTests':tests,'imports':imports,'recoveryManifestSha256':hashlib.sha256((APP/'editorial/reviews/cric-c1-100-root-recovery-20261126.json').read_bytes()).hexdigest(),'publishedAndHistoricalPayloads':'EXACTLY_RETAINED','productUI':'PENDING_REGISTERED_INCREMENTAL_REPLAY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('ROOT_ACCEPTED90_TOTAL4100_REGISTERED3792',flush=True)
