from pathlib import Path
import json,sys,shutil,subprocess,os
APP=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
REF=v.BASELINE;FP='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba';SRC=APP/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';BASE=APP/'editorial/reviews/c1-work-axis-side-historical-1a-20261126';BASE.mkdir(exist_ok=False)
T=Path('/private/tmp/cric-work-side-historical-1a-app');shutil.copytree('/private/tmp/cric-c1-six-closures-4c83-app',T,symlinks=True)
names=subprocess.check_output(['git','diff','--name-only',REF,'64aef05bef5ca7ebff8491060762dd4cac0cbb34','--','officina-di-fisica/server','officina-di-fisica/static','officina-di-fisica/content','officina-di-fisica/policies','officina-di-fisica/extensions','officina-di-fisica/migrations','officina-di-fisica/contracts'],cwd=APP.parent).decode().splitlines();pins={}
for name in names:
 raw=v.git_bytes(REF,name);target=T/name.removeprefix('officina-di-fisica/');target.write_bytes(raw);pins[name]=v.sha(raw)
plan=v.load('/private/tmp/cric-c1-six-closures-4c83-actual/prepared.json');row=next(r for r in plan['records']if r['id']=='SIM-C1-L007-01');row['grid']=[0];row['expectedValues']=[12];plan['records']=[row];plan['profiles']=[{'width':320,'fallback':False,'view':'side'}];plan['expectedCaseKeys']=['SIM-C1-L007-01|published|320|side|setup','SIM-C1-L007-01|published|320|side|grid|0'];plan['sourceCommit']=REF
plan['packageFiles']=[str(T/Path(x).relative_to('/private/tmp/cric-c1-six-closures-4c83-app'))for x in plan['packageFiles']];plan['inputFiles']={str(T/Path(x).relative_to('/private/tmp/cric-c1-six-closures-4c83-app')):pin for x,pin in plan['inputFiles'].items()}
env={**os.environ,'ASTRA_EXTENSIONS':str(T/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'};fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env=env));assert fp['sha256']==FP;plan['runtimeFingerprint']=fp
for name,pin in plan['inputFiles'].items():assert pin==v.sha(v.git_bytes(REF,'officina-di-fisica/editorial/batches/'+Path(name).name))
for name in ['independent-reused-primary.json','collector-c1-derived.mjs']:shutil.copy2(SRC/name,BASE/name)
r=v.load(SRC/'review-request.json');r.update({'candidateRef':REF,'runtimeSha256':FP,'inputFiles':plan['inputFiles'],'packageFiles':plan['packageFiles'],'scope':'HISTORICAL1A_ACTUAL_SINGLE_SIDE320_SOURCE_ALPHA0_PAIR_WITH4C83_NO_NEW_ACCEPTANCE'})
(BASE/'review-request.json').write_bytes(v.canonical(r)+b'\n');plan['requestSha256']=v.sha((BASE/'review-request.json').read_bytes());plan['requestFile']=str(BASE/'review-request.json');plan['scope']=r['scope'];plan['course']='HISTORICAL1A_C1_WORK_SIDE'
run=(SRC/'run-six.py').read_text().replace('64aef05bef5ca7ebff8491060762dd4cac0cbb34',REF).replace('4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907',FP);(BASE/'run-single.py').write_text(run)
out=Path('/private/tmp/cric-work-side-historical-1a-actual');out.mkdir(exist_ok=False);(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':str(T),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']};(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
(BASE/'prepare-receipt.json').write_bytes(v.canonical({'historicalGitRef':REF,'runtimeSha256':FP,'restoredRuntimeFiles':pins,'plannedCaseKeys':plan['expectedCaseKeys'],'currentShared139ProtocolsUnmodified':True,'activityCredit':0})+b'\n');print(BASE/'run-single.py')
