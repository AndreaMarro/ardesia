"""Replay final independent evidence using canonical imports, without publication."""
import fcntl,hashlib,importlib,json,os,re,shutil,subprocess,sys
from pathlib import Path
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();OUT=APP/'editorial/reviews/u7-03-root-integration-20261126';OUT.mkdir(exist_ok=True)
recovery=json.loads((APP/'editorial/reviews/u7-03-root-recovery-20261126.json').read_text())
def check():
 for path,info in recovery['files'].items():assert hashlib.sha256((APP/path).read_bytes()).hexdigest()==info['sha256'],path
with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>2*1024**3;check();runtime=runtime_fingerprint(APP)
 env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1');env.pop('CRIC_REVIEW_CANDIDATE_APP',None)
 tests=[]
 for part in ['260','261_262']:
  candidates=[p for p in recovery['files']if p.startswith('tests/corpus/test_') and part in p and p.endswith('.py')];assert len(candidates)==1,candidates
  p=candidates[0];result=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p',Path(p).name,'-v'],cwd=APP,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=180)
  log=OUT/('root-tests-'+part+'.txt');log.write_bytes(result.stdout);print(part,result.returncode,result.stdout.decode()[-180:],flush=True);assert result.returncode==0
  match=re.search(rb'Ran (\d+) tests in ([0-9.]+)s',result.stdout);assert match
  tests.append({'group':part,'count':int(match[1]),'seconds':float(match[2]),'actualExitCode':0,'logSha256':hashlib.sha256(result.stdout).hexdigest()})
 imports=[]
 for spec in json.loads((APP/'editorial/assignments/u7-03-v1.json').read_text())['assignments']:
  batch=spec['batchId'];module=importlib.import_module('tools.corpus_engineering.'+batch.rsplit('-',1)[0].replace('-','_')+'_verifier')
  package=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text());bindings=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_text())
  actual=module.report(package,bindings,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text());assert actual==saved,batch
  assert_record_identity(actual['records'],set(spec['questionIds']),package,bindings)
  result=exercise(batch);assert(result['firstImport']['saved'],result['repeatedImport']['saved'],result['repeatedImport']['unchanged'])==(16,0,16)
  assert result['beforePublishedCount']==result['afterPublishedCount']==991 and result['beforePublishedSha256']==result['afterPublishedSha256']
  target=APP/'editorial/reviews'/f'{batch}-integration.json';target.write_text(canonical(result)+'\n');imports.append({'batch':batch,'questionIds':spec['questionIds'],'integrationSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'firstSaved':16,'repeatSaved':0,'repeatUnchanged':16});print('Canonical import',batch,'16→0/16',flush=True)
 check();assert runtime==runtime_fingerprint(APP);assert sum(len(row['questionIds'])for row in imports)==48
 from tools.corpus_engineering.pipeline import load_checkpoint
 entries,_,_=load_checkpoint(APP/'editorial/corpus')
 original_ids={r['id']for r in entries if r['origin']=='ardesia'}
 registered=[q for b in json.loads((APP/'editorial/batches/registry.json').read_bytes())['batches']for q in b['questionIds']]
 prior=[q for b in json.loads((APP/'editorial/reviews/u7-02-root-integration-20261126/receipt.json').read_bytes())['imports']for q in b['questionIds']]
 new=[q for b in imports for q in b['questionIds']]
 all_ids=registered+prior+new
 assert len(all_ids)==len(set(all_ids))==len(original_ids)==4000 and set(all_ids)==original_ids
 audit={'scope':'Exact4000Ardesia ID reconciliation, not extra scientific credit','checkpoint':json.loads((APP/'editorial/corpus/checkpoint.json').read_bytes()),'registeredArdesia':len(registered),'acceptedPendingRegistrationU702':len(prior),'acceptedPendingRegistrationU703':len(new),'missingIds':sorted(original_ids-set(all_ids)),'unexpectedIds':sorted(set(all_ids)-original_ids),'uniqueReviewedIds':sorted(all_ids),'remainingCricSourceIds':sorted(r['id']for r in entries if r['origin']=='cric'),'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'ardesia4000-id-reconciliation.json').write_text(json.dumps(audit,indent=2)+'\n')
 receipt={'scope':'Root final canonical files; separate A/B authors and cross-reviewers; no fixture fallback','scientificRecordsAccepted':48,'scientificallyReviewedQuestions':4000,'scientificallyUnreviewedQuestions':606,'compiledOfficialQuestionDrafts':3632,'registeredQuestionDrafts':3792,'registrationState':'PENDING_PRIOR3792_REMOTE_ADOPTION','rootTests':tests,'imports':imports,'recoveryManifestSha256':hashlib.sha256((APP/'editorial/reviews/u7-03-root-recovery-20261126.json').read_bytes()).hexdigest(),'productUI':'NOT_RUN_FOR_THESE160','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('ROOT_ACCEPTED48_TOTAL4000_REGISTERED3792',flush=True)
