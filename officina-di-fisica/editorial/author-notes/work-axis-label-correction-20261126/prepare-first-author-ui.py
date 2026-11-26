from pathlib import Path
import json,shutil,subprocess,sys,os
CORE=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(CORE))
from tools.corpus_engineering import experiment_visibility_request as v
APP=Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica');B=APP/'editorial/author-notes/work-axis-label-correction-20261126';v.REPO=APP.parent
REF='b38d8b8dd1dd3d69f558bbe8753d759084aa527f';FP='95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d';T=Path('/private/tmp/cric-work-axis-author-ui-app')
def ignore(folder,names):return [n for n in names if n=='__pycache__'or(Path(folder)==APP and n in ['editorial','tests'])]
shutil.copytree(APP,T,symlinks=True,ignore=ignore)
parent=CORE/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';plan=v.load(parent/'actual-first-diagnostic-616/prepared.json');row=next(r for r in plan['records']if r['id']=='SIM-C1-L007-01');row['grid']=[0,90,120,180];row['expectedValues']=[12,0,12*__import__('math').cos(120*__import__('math').pi/180),-12];row['originalJudgment']={'sourceMathReview':'Previously independently reviewed; this is AUTHOR runtime technical replay only','activityCredit':0};plan['records']=[row];plan['sourceCommit']=REF;plan['course']='AUTHOR_WORK_AXIS_RENDER';plan['scope']='AUTHOR_TECHNICAL40_ONLY_INDEPENDENT_SCI_REVIEW_PENDING';plan['packageFiles']=[str(T/Path(p).relative_to('/private/tmp/cric-c1-six-closures-4c83-app'))for p in plan['packageFiles']];plan['inputFiles']={str(T/Path(p).relative_to('/private/tmp/cric-c1-six-closures-4c83-app')):pin for p,pin in plan['inputFiles'].items()}
for name,pin in plan['inputFiles'].items():
 p=Path(name);p.parent.mkdir(parents=True,exist_ok=True);raw=v.git_bytes(REF,'officina-di-fisica/editorial/batches/'+p.name);assert v.sha(raw)==pin;p.write_bytes(raw)
primary={'currentRole':'AUTHOR of this isolated runtime correction, not scientific approver','priorIndependentReview':'Frozen4c83/1a negatives are immutable and cited, no self-approval of their repair','sourceAndPhysics':'All181 inputs unchanged;18330 installed context exact same quantities/teaching/non-label primitives. Four authored technical regressions only.','activityCredit':0}
(B/'independent-reused-primary.json').write_bytes(v.canonical(primary)+b'\n');shutil.copy2(parent/'collector-c1-derived.mjs',B/'collector-c1-derived.mjs')
r=v.load(parent/'review-request.json');r.update({'candidateRef':REF,'runtimeSha256':FP,'inputFiles':plan['inputFiles'],'packageFiles':plan['packageFiles'],'scope':plan['scope'],'primarySha256':v.sha((B/'independent-reused-primary.json').read_bytes()),'collectorSha256':v.sha((B/'collector-c1-derived.mjs').read_bytes())});(B/'review-request.json').write_bytes(v.canonical(r)+b'\n')
plan['requestFile']=str(B/'review-request.json');plan['requestSha256']=v.sha((B/'review-request.json').read_bytes());plan['expectedCaseKeys']=[]
for p in plan['profiles']:
 stem='|'.join([row['id'],row['variant'],str(p['width']),p['view']]);plan['expectedCaseKeys'] +=[stem+'|setup']+[stem+'|grid|'+str(i)for i in range(4)]
assert len(plan['expectedCaseKeys'])==40
env={**os.environ,'ASTRA_EXTENSIONS':str(T/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'};fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env=env));assert fp['sha256']==FP;plan['runtimeFingerprint']=fp
out=Path('/private/tmp/cric-work-axis-author-actual-40');out.mkdir(exist_ok=False);(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':str(T),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']};(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
s=(parent/'run-six.py').read_text().replace("APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))","APP=Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica');sys.path.insert(0,'/private/tmp/cric-experiment-contract-fix/officina-di-fisica')").replace('from tools.corpus_engineering import experiment_visibility_request as v','from tools.corpus_engineering import experiment_visibility_request as v\nv.REPO=APP.parent').replace('64aef05bef5ca7ebff8491060762dd4cac0cbb34',REF).replace('4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907',FP)
(B/'run-author-40.py').write_text(s);print(B/'run-author-40.py')
