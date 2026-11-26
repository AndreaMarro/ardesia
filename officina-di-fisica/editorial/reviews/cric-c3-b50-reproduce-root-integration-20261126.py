"""Replay crossed B50 thermodynamics reviews and canonical imports; no publication."""
import fcntl,hashlib,importlib,json,os,re,shutil,subprocess,sys
from pathlib import Path
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();OUT=APP/'editorial/reviews/cric-c3-b50-root-integration-20261126';OUT.mkdir(exist_ok=True)
recovery=json.loads((APP/'editorial/reviews/cric-c3-b50-root-recovery-20261126.json').read_bytes())
def check():
 for p,v in recovery['files'].items():assert hashlib.sha256((APP/p).read_bytes()).hexdigest()==v['sha256'],p
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>2*1024**3;check();runtime=runtime_fingerprint(APP)
 env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1');env.pop('CRIC_REVIEW_CANDIDATE_APP',None)
 p=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p','test_cross_review_cric_c3_l06_l10_a.py','-v'],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
 (OUT/'actual-root-tests.txt').write_bytes(p.stdout);print(p.stdout.decode()[-800:],flush=True);assert p.returncode==0
 match=re.search(rb'Ran (\d+) tests in ([0-9.]+)s',p.stdout);assert match and int(match[1])==21
 imports=[]
 for spec in json.loads((APP/'editorial/assignments/cric-606-v1.json').read_bytes())['assignments']:
  batch=spec['batchId']
  if batch not in {f'cric-c3-l{i:02d}'for i in range(6,11)}:continue
  module=importlib.import_module('tools.corpus_engineering.'+batch.replace('-','_')+'_verifier')
  package=json.loads((APP/'editorial/batches'/f'{batch}.json').read_bytes());bindings=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_bytes())
  fresh=module.report(package,bindings,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_bytes());assert fresh==saved,batch
  assert_record_identity(fresh['records'],set(spec['questionIds']),package,bindings)
  result=exercise(batch);assert(result['firstImport']['saved'],result['repeatedImport']['saved'],result['repeatedImport']['unchanged'],result['preservedLiveHeads'])==(10,0,10,10)
  assert result['beforePublishedCount']==result['afterPublishedCount']==991 and result['beforePublishedSha256']==result['afterPublishedSha256']
  target=APP/'editorial/reviews'/f'{batch}-integration.json';target.write_text(canonical(result)+'\n');imports.append({'batch':batch,'questionIds':spec['questionIds'],'firstSaved':10,'repeatSaved':0,'repeatUnchanged':10,'preservedLiveHeads':10,'integrationSha256':hashlib.sha256(target.read_bytes()).hexdigest()});print('CANONICAL_IMPORT',batch,'10→0/10',flush=True)
 check();assert runtime==runtime_fingerprint(APP);assert sum(len(r['questionIds'])for r in imports)==50
 receipt={'scope':'Root fifty new C3 revisions with separate author B and verifier A, all original IDs and versions retained','scientificRecordsAccepted':50,'scientificallyReviewedQuestions':4300,'scientificallyUnreviewedQuestions':306,'rootTests':{'count':int(match[1]),'seconds':float(match[2]),'actualExitCode':0},'imports':imports,'recoveryManifestSha256':hashlib.sha256((APP/'editorial/reviews/cric-c3-b50-root-recovery-20261126.json').read_bytes()).hexdigest(),'runtimeSha256':runtime['sha256'],'publishedAndHistoricalPayloads':'EXACTLY_RETAINED','productUI':'PENDING_REGISTERED_INCREMENTAL_REPLAY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('ROOT_ACCEPTED50_TOTAL4300',flush=True)
