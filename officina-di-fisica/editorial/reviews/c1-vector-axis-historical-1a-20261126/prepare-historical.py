from pathlib import Path
import sys,json,shutil,subprocess,os
APP=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
B=APP/'editorial/reviews/c1-vector-axis-historical-1a-20261126';B.mkdir(exist_ok=False);P=APP/'editorial/reviews/c1-vector-axis-followup-95769-20261126';T=Path('/private/tmp/cric-work-side-historical-1a-app');FP='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba';REF=v.BASELINE
plan=v.load('/private/tmp/cric-c1-vector-axis-followup-95769-actual-112/prepared.json');old='/private/tmp/cric-c1-five-95769-review-app';plan['packageFiles']=[str(T/Path(p).relative_to(old))for p in plan['packageFiles']];plan['inputFiles']={str(T/Path(p).relative_to(old)):pin for p,pin in plan['inputFiles'].items()};plan['profiles']=[{'width':320,'fallback':False,'view':'side'}];plan.update({'sourceCommit':REF,'scope':'ACTUAL_HISTORICAL1A_FIVE_VECTOR_IDS_SIDE320_ALPHA0_INCLUDING_TWO_DRAFTS_NO_CREDIT','course':'C1_VECTOR_HISTORICAL1A'});plan['expectedCaseKeys']=[]
for r in plan['records']:
 stem='|'.join([r['id'],r['variant'],'320','side']);plan['expectedCaseKeys'] +=[stem+'|setup',stem+'|grid|0']
assert len(plan['expectedCaseKeys'])==14
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(T/'extensions')};fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env=env));assert fp['sha256']==FP;plan['runtimeFingerprint']=fp
for n in ['collector-c1-derived.mjs','numerical-observation.mjs','independent-reused-primary.json']:shutil.copy2(P/n,B/n)
r=v.load(P/'review-request.json');r.update({'candidateRef':REF,'runtimeSha256':FP,'packageFiles':plan['packageFiles'],'inputFiles':plan['inputFiles'],'scope':plan['scope']});(B/'review-request.json').write_bytes(v.canonical(r)+b'\n');plan.update({'requestSha256':v.sha((B/'review-request.json').read_bytes()),'requestFile':str(B/'review-request.json')})
s=(P/'run-followup.py').read_text().replace('7173a92ce980f102f0904175c90c0f7a150b2931',REF).replace('95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d',FP);(B/'run-historical.py').write_text(s)
out=Path('/private/tmp/cric-c1-vector-historical-1a-actual-14');out.mkdir(exist_ok=False);(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':str(T),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']};(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
print('planned',len(plan['expectedCaseKeys']),'historicalFP',FP)
