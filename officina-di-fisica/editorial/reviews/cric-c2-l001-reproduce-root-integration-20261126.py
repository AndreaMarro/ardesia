"""Actual Root replay through existing independent verifier and canonical importer."""
import fcntl,hashlib,importlib,json,os,re,subprocess,sys
from pathlib import Path
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path.cwd();OUT=APP/'editorial/reviews/cric-c2-l001-root-integration-20261126';OUT.mkdir(exist_ok=True)
recovery=json.loads((APP/'editorial/reviews/cric-c2-l001-root-recovery-20261126.json').read_text())
def check():
 for p,v in recovery['files'].items():assert hashlib.sha256((APP/p).read_bytes()).hexdigest()==v['sha256'],p
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);check();before=runtime_fingerprint(APP)
 env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1');env.pop('CRIC_REVIEW_CANDIDATE_APP',None)
 p=subprocess.run([sys.executable,'-B','-m','unittest','discover','-s','tests/corpus','-p','test_cric_c2_l001_independent.py','-v'],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);(OUT/'actual-root-tests.txt').write_bytes(p.stdout);print(p.stdout.decode()[-600:],flush=True);assert p.returncode==0
 match=re.search(rb'Ran (\d+) tests in ([0-9.]+)s',p.stdout);assert match and int(match[1])==13
 from tools.corpus_engineering import cric_c2_l001_verifier as verifier
 batch='cric-c2-l001';package=json.loads((APP/'editorial/batches'/f'{batch}.json').read_bytes());bindings=json.loads((APP/'editorial/batches'/f'{batch}-bindings.json').read_bytes())
 fresh=verifier.report(package,bindings,APP/'editorial/assets');saved=json.loads((APP/'editorial/reviews'/f'{batch}.json').read_bytes());assert fresh==saved
 ids={f'C2-Q{n:03}'for n in range(1,11)};assert_record_identity(fresh['records'],ids,package,bindings)
 imported=exercise(batch);assert(imported['firstImport']['saved'],imported['repeatedImport']['saved'],imported['repeatedImport']['unchanged'],imported['preservedLiveHeads'])==(10,0,10,10)
 assert imported['beforePublishedCount']==imported['afterPublishedCount']==991 and imported['beforePublishedSha256']==imported['afterPublishedSha256']
 target=APP/'editorial/reviews'/f'{batch}-integration.json';target.write_text(canonical(imported)+'\n');check();assert before==runtime_fingerprint(APP)
 receipt={'scope':'Root first10 C2 original questions; distinct author A/peer B, no new application publication','batch':batch,'questionIds':sorted(ids),'scientificRecordsAccepted':10,'scientificallyReviewedQuestions':4110,'scientificallyUnreviewedQuestions':496,'rootTests':{'count':int(match[1]),'seconds':float(match[2]),'actualExitCode':0},'import':{'firstSaved':10,'repeatSaved':0,'repeatUnchanged':10,'preservedLiveHeads':10,'integrationSha256':hashlib.sha256(target.read_bytes()).hexdigest()},'publishedAndHistoricalPayloads':'EXACTLY_RETAINED','runtimeSha256':before['sha256'],'productUI':'PENDING_INCREMENTAL_REGISTERED_REPLAY','humanApproval':'NOT_RUN','publicationAction':'NONE'}
 (OUT/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print('ROOT_ACCEPTED10_TOTAL4110',flush=True)
