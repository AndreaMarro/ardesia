"""Prepare a fresh run only after the integrator freezes the final immutable epoch."""
from pathlib import Path
import json,hashlib,subprocess,shutil,sys,os,re
CORE=Path('/private/tmp/cric-experiment-contract-fix');APP=CORE/'officina-di-fisica';CURRENT=Path('/private/tmp/cric-method-css-748-independent-app');OLD=APP/'editorial/reviews/c1-five-closures-927-renewal-20261126'
REF,FP,NAME=sys.argv[1:];assert re.fullmatch('[a-f0-9]{40}',REF)and re.fullmatch('[a-f0-9]{64}',FP)and re.fullmatch('[a-z0-9-]+',NAME)
B=APP/'editorial/reviews'/NAME;assert not B.exists();B.mkdir()
def load(p):return json.loads(p.read_bytes())
def raw(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
plan=load(OLD/'actual-ui-576/prepared.json');old='/private/tmp/cric-c1-five-927-review-app';plan['packageFiles']=[str(CURRENT/Path(p).relative_to(old))for p in plan['packageFiles']];plan['inputFiles']={str(CURRENT/Path(p).relative_to(old)):h for p,h in plan['inputFiles'].items()}
assert set((CURRENT/'editorial/batches').iterdir())==set(map(Path,plan['inputFiles']))
for p,h in plan['inputFiles'].items():
 assert sha(Path(p))==h
 assert hashlib.sha256(subprocess.check_output(['git','-c','gc.auto=0','show',REF+':officina-di-fisica/editorial/batches/'+Path(p).name],cwd=CORE,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})).hexdigest()==h
for name in ['collector-c1-derived.mjs','numerical-observation.mjs']:shutil.copy2(OLD/name,B/name)
primary=load(OLD/'independent-reused-primary.json');primary['runtimeReview']='Frozen independent physical/manual models reused with disclosed previous reading; new actual UI and installed Node execution required. No927/1a UI approvals transferred. Six authored vector IDs excluded.';(B/'independent-reused-primary.json').write_bytes(raw(primary)+b'\n')
r=load(OLD/'review-request.json');r.update(candidateRef=REF,runtimeSha256=FP,packageFiles=plan['packageFiles'],inputFiles=plan['inputFiles'],primarySha256=sha(B/'independent-reused-primary.json'),collectorSha256=sha(B/'collector-c1-derived.mjs'),numericalHelperSha256=sha(B/'numerical-observation.mjs'),scope='INDEPENDENT_FIVE_C1_FRESH_REAL_UI_NO_ACTIVITY_CREDIT_ALLSIX_VECTOR_AUTHOR_IDS_RECUSED');(B/'review-request.json').write_bytes(raw(r)+b'\n')
fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=CURRENT,env={**os.environ,'ASTRA_EXTENSIONS':str(CURRENT/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'}));assert fp['sha256']==FP
plan.update(sourceCommit=REF,runtimeFingerprint=fp,requestFile=str(B/'review-request.json'),requestSha256=sha(B/'review-request.json'),scope=r['scope'],course='C1_FIVE_CURRENT_EPOCH_RENEWAL_SIX_AUTHORED_RECUSED',numericalHelperSha256=r['numericalHelperSha256']);assert len(plan['expectedCaseKeys'])==576
out=Path('/private/tmp')/('cric-'+NAME+'-actual-576');out.mkdir();(out/'prepared.json').write_bytes(raw(plan)+b'\n');(out/'prepared-info.json').write_bytes(raw({'candidateApp':str(CURRENT),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']})+b'\n')
s=(OLD/'run-five.py').read_text().replace("v.REPO=Path('/private/tmp/cric-vector-apparatus-author-20261126')","v.REPO=Path('/private/tmp/cric-experiment-contract-fix')").replace("REF='27503c36097b196fb7003a6448a9aaf7ee21baf0'",'REF='+repr(REF)).replace("FP='9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d'",'FP='+repr(FP));(B/'run-five.py').write_text(s);shutil.copy2(__file__,B/'prepare-five-current-no-clone.py');print(out/'prepared-info.json')
