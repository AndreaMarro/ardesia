import fcntl,hashlib,json,os,re,subprocess,sys,time,importlib,shutil
from pathlib import Path
APP=Path.cwd();sys.path.insert(0,str(APP))
from tools.corpus_engineering.pipeline import digest,canonical,sha
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
recovery=json.loads((APP/'editorial/reviews/u6-03-A80-root-recovery-20261125.json').read_text());OUT=APP/'editorial/reviews/u6-03-A80-root-integration-20261125';OUT.mkdir(exist_ok=True)
def check_files():
 for rel,e in recovery['files'].items():assert sha((APP/rel).read_bytes())==e['sha256'],rel
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage('/private/tmp').free>2*1024**3;check_files();runtime=runtime_fingerprint(APP)
 env={**os.environ,'PYTHONPATH':'.','PYTHONDONTWRITEBYTECODE':'1'};env.pop('CRIC_REVIEW_CANDIDATE_APP',None)
 cmd=[sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p','test_u6_circuit_power_210_214_independent.py','-v'];r=subprocess.run(cmd,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=120);log=OUT/'root-tests.txt';log.write_text(r.stdout);assert r.returncode==0,r.stdout;match=re.search(r'Ran (\d+) tests in ([0-9.]+)s',r.stdout);assert match and int(match[1])==17;print(r.stdout[-180:],flush=True)
 specs=json.loads((APP/'editorial/assignments/u6-03-v1.json').read_text())['assignments'][:5];rows=[]
 for spec in specs:
  batch=spec['batchId'];m=importlib.import_module('tools.corpus_engineering.'+batch.rsplit('-',1)[0].replace('-','_')+'_verifier');p=json.loads((APP/'editorial/batches'/f'{batch}.json').read_text());b=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_text());assert digest(p)==m.REVIEWED_PACKAGE_SHA256 and digest(b)==m.REVIEWED_BINDINGS_SHA256
  fresh=m.report(p,b,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_text());assert fresh==saved;assert_record_identity(fresh['records'],set(spec['questionIds']),p,b);assert len(fresh['records'])==16 and all(x['ok']is True for x in fresh['records'])
  result=exercise(batch);assert(result['firstImport']['saved'],result['repeatedImport']['saved'],result['repeatedImport']['unchanged'])==(16,0,16);assert result['beforePublishedCount']==result['afterPublishedCount']==991
  path=APP/'editorial/reviews'/f'{batch}-integration.json';path.write_text(canonical(result)+'\n');rows.append({'batch':batch,'questionIds':spec['questionIds'],'packageSha256':sha((APP/'editorial/batches'/f'{batch}.json').read_bytes()),'reportSha256':sha((APP/'editorial/reviews'/f'{batch}.json').read_bytes()),'importSha256':sha(path.read_bytes()),'firstSaved':16,'repeatSaved':0,'repeatUnchanged':16,'published991BytesUnchanged':result['beforePublishedSha256']==result['afterPublishedSha256']})
 check_files();assert runtime==runtime_fingerprint(APP);assert sum(len(r['questionIds'])for r in rows)==80
 receipt={'scope':'Root canonical final files, separate author A/reviewer B; no fixture fallback','scientificRecordsAccepted':80,'scientificallyReviewedQuestions':3232,'scientificallyUnreviewedQuestions':1374,'compiledOfficialQuestionDrafts':2992,'compiledStagingQuestionDrafts':3152,'rootTests':{'count':17,'seconds':float(match[2]),'actualExitCode':r.returncode,'logSha256':sha(log.read_bytes())},'separateHandoffSha256':'da365a1a8185171960654c6b75cf7049cc1a3410c66dac825170b747a7c93eb2','filesVerifiedBeforeAndAfter':recovery['files'],'imports':rows,'productUI':'NOT_RUN_FOR_THESE80','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items()if k not in['filesVerifiedBeforeAndAfter','imports']}),flush=True)
