"""Refresh ten unchanged records and integrate forty new distinct C2 reviews."""
import fcntl,hashlib,importlib,json,os,re,shutil,subprocess,sys
from pathlib import Path
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();BASE=APP/'editorial/reviews/cric-c2-a50-root-recovery-20261126';OUT=APP/'editorial/reviews/cric-c2-a50-root-integration-20261126';OUT.mkdir(exist_ok=True)
recovery=json.loads((BASE/'receipt.json').read_bytes())
def check():
 for p,v in recovery['files'].items():assert hashlib.sha256((APP/p).read_bytes()).hexdigest()==v['sha256'],p
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>2*1024**3;check();runtime=runtime_fingerprint(APP)
 env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1');env.pop('CRIC_REVIEW_CANDIDATE_APP',None);tests=[]
 patterns=[f'test_cric_c2_l{i:03d}_independent.py'for i in range(1,6)]+['test_cric_c2_accessible_svg_independent.py']
 for pattern in patterns:
  assert 'tests/corpus/'+pattern in recovery['files'];p=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p',pattern,'-v'],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
  (OUT/('actual-'+pattern+'.txt')).write_bytes(p.stdout);print(pattern,p.returncode,p.stdout.decode()[-180:],flush=True);assert p.returncode==0
  match=re.search(rb'Ran (\d+) tests in ([0-9.]+)s',p.stdout);assert match and int(match[1])>0;tests.append({'pattern':pattern,'count':int(match[1]),'seconds':float(match[2]),'actualExitCode':0,'logSha256':hashlib.sha256(p.stdout).hexdigest()})
 imports=[]
 for spec in json.loads((APP/'editorial/assignments/cric-606-v1.json').read_bytes())['assignments']:
  batch=spec['batchId']
  if batch not in {f'cric-c2-l{i:03d}'for i in range(1,6)}:continue
  m=importlib.import_module('tools.corpus_engineering.'+batch.replace('-','_')+'_verifier');package=json.loads((APP/'editorial/batches'/f'{batch}.json').read_bytes());bindings=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_bytes())
  fresh=m.report(package,bindings,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_bytes());assert fresh==saved;assert_record_identity(fresh['records'],set(spec['questionIds']),package,bindings)
  if batch=='cric-c2-l001':
   old=json.loads((BASE/'before/editorial/reviews/cric-c2-l001.json').read_bytes());assert old['records']==fresh['records'];continue
  result=exercise(batch);assert(result['firstImport']['saved'],result['repeatedImport']['saved'],result['repeatedImport']['unchanged'],result['preservedLiveHeads'])==(10,0,10,10)
  assert result['beforePublishedCount']==result['afterPublishedCount']==991 and result['beforePublishedSha256']==result['afterPublishedSha256']
  target=APP/'editorial/reviews'/f'{batch}-integration.json';target.write_text(canonical(result)+'\n');imports.append({'batch':batch,'questionIds':spec['questionIds'],'firstSaved':10,'repeatSaved':0,'repeatUnchanged':10,'preservedLiveHeads':10,'integrationSha256':hashlib.sha256(target.read_bytes()).hexdigest()});print('CANONICAL_IMPORT',batch,'10→0/10',flush=True)
 check();assert runtime==runtime_fingerprint(APP);assert sum(r['count']for r in tests)==69 and sum(len(x['questionIds'])for x in imports)==40
 receipt={'scope':'Forty new C2 revisions plus fresh validation of ten previously accepted unchanged records; no duplicated question credit','scientificRecordsAccepted':40,'previouslyAcceptedRecordsRenewedWithoutNewCredit':10,'scientificallyReviewedQuestions':4150,'scientificallyUnreviewedQuestions':456,'rootTests':tests,'imports':imports,'accessibleTextGuard':'New adversarial title/desc mutations with all pins renewed rejected; original negative and five changed001 files preserved, actual candidates/models unchanged','candidate001ScientificRecordsUnchanged':True,'runtimeSha256':runtime['sha256'],'publishedAndHistoricalPayloads':'EXACTLY_RETAINED','productUI':'PENDING_REGISTERED_INCREMENTAL_REPLAY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('ROOT_ACCEPTED40_TOTAL4150_REFRESHED10_NO_EXTRA_CREDIT',flush=True)
