from pathlib import Path
import sys,json,shutil,subprocess,os
APP=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
P=APP/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';B=APP/'editorial/reviews/c1-five-closures-95769-renewal-20261126';REF='7173a92ce980f102f0904175c90c0f7a150b2931';FP='95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d';AUTHOR=Path('/private/tmp/cric-work-axis-author-20261126');v.REPO=AUTHOR
T=Path('/private/tmp/cric-c1-five-95769-review-app');shutil.copytree('/private/tmp/cric-c1-six-closures-4c83-app',T,symlinks=True);(T/'static/js/banchi/voci/esperimento.js').write_bytes(v.git_bytes(REF,'officina-di-fisica/static/js/banchi/voci/esperimento.js'))
plan=v.load(P/'actual-first-diagnostic-616/prepared.json');plan['records']=[r for r in plan['records']if r['id']!='SIM-C1-L007-01'];assert len(plan['records'])==6
plan['packageFiles']=[str(T/Path(p).relative_to('/private/tmp/cric-c1-six-closures-4c83-app'))for p in plan['packageFiles']];plan['inputFiles']={str(T/Path(p).relative_to('/private/tmp/cric-c1-six-closures-4c83-app')):pin for p,pin in plan['inputFiles'].items()}
# Compare observations to the actual installed wrapper. Independent exact
# physics/manual derivations remain the separately frozen primary.
script="import fs from'node:fs';import{esperienza}from'./static/js/banchi/voci/esperimento.js';const rs=JSON.parse(fs.readFileSync(0));const out=[];for(const r of rs){const a=await esperienza(r.record);out.push(r.grid.map(x=>a.model.solve({x}).y));}console.log(JSON.stringify(out));"
ys=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=T,input=v.canonical(plan['records'])))
for row,y in zip(plan['records'],ys):row['expectedValues']=y
primary=v.load(P/'independent-reused-primary.json');primary['records']=[r for r in primary['records']if r['id']!='SIM-C1-L007-01'];primary.update({'currentRole':'Independent reviewer for these5original IDs, explicitly recused from authored SIM-C1-L007-01','runtimeReview':'All C1 physical laws/apparatus/source are unchanged. New compiled caller guard is false for these5IDs; guides/clock changes from1a have been read and are actually replayed. Source-v1 normal40degree manual FAIL remains retained.','excludedAuthorId':'SIM-C1-L007-01'});(B/'independent-reused-primary.json').write_bytes(v.canonical(primary)+b'\n')
raw=(P/'collector-c1-derived.mjs').read_text();raw=raw.replace("import assert from 'node:assert/strict';","import assert from 'node:assert/strict';\nimport {valueWitness,assertValue} from './numerical-observation.mjs';")
needle="if(state.kind==='grid')assert.ok(measured.model.y===r.expectedValues[state.index],'Frozen independently reviewed numerical state drifted');";assert raw.count(needle)==1
raw=raw.replace(needle,"""if(state.kind==='grid'){
      measured.numericalWitness=valueWitness(measured.model.y,r.expectedValues[state.index],r.id,state.x);
      await fs.appendFile(path.join(out,'pre-comparison-witness.jsonl'),JSON.stringify({caseKey,...measured.numericalWitness})+'\\n');
      assertValue(measured.numericalWitness);
     }""")
raw=raw.replace('protocolSha256:protocolSha,...value,','protocolSha256:protocolSha,reviewDependencySha256:plan.numericalHelperSha256,...value,');(B/'collector-c1-derived.mjs').write_text(raw)
r=v.load(P/'review-request.json');r.update({'candidateRef':REF,'runtimeSha256':FP,'packageFiles':plan['packageFiles'],'inputFiles':plan['inputFiles'],'primarySha256':v.sha((B/'independent-reused-primary.json').read_bytes()),'collectorSha256':v.sha((B/'collector-c1-derived.mjs').read_bytes()),'numericalHelperSha256':v.sha((B/'numerical-observation.mjs').read_bytes()),'scope':'INDEPENDENT_FIVE_C1_CLOSURE_SUPPORT_EXCLUDES_AUTHORED00701_NO_GROUP_OR_ACTIVITY_CREDIT'});(B/'review-request.json').write_bytes(v.canonical(r)+b'\n')
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(T/'extensions')};fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env=env));assert fp['sha256']==FP
plan.update({'sourceCommit':REF,'runtimeFingerprint':fp,'requestFile':str(B/'review-request.json'),'requestSha256':v.sha((B/'review-request.json').read_bytes()),'scope':r['scope'],'course':'C1_FIVE_CLOSURE_RENEWAL_EXCLUDING00701','numericalHelperSha256':r['numericalHelperSha256']});keys=[]
for row in plan['records']:
 for p in plan['profiles']:
  stem='|'.join([row['id'],row['variant'],str(p['width']),p['view']]);keys.append(stem+'|setup')
  for kind,items in [('grid',row['grid']),('clock',row['clockCases'])]:keys +=[stem+'|'+kind+'|'+str(i)for i in range(len(items))]
assert len(keys)==576;plan['expectedCaseKeys']=keys
out=Path('/private/tmp/cric-c1-five-95769-actual-576');out.mkdir(exist_ok=False);(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':str(T),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']};(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
s=(P/'run-six.py').read_text().replace('from tools.corpus_engineering import experiment_visibility_request as v','from tools.corpus_engineering import experiment_visibility_request as v\nv.REPO=Path(\'/private/tmp/cric-work-axis-author-20261126\')').replace('64aef05bef5ca7ebff8491060762dd4cac0cbb34',REF).replace('4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907',FP)
s=s.replace(" if r['collectorSha256']!=v.sha((BASE/'collector-c1-derived.mjs').read_bytes()):", " if r['numericalHelperSha256']!=v.sha((BASE/'numerical-observation.mjs').read_bytes())or plan['numericalHelperSha256']!=r['numericalHelperSha256']:raise ValueError('Numerical review helper drift')\n if r['collectorSha256']!=v.sha((BASE/'collector-c1-derived.mjs').read_bytes()):")
(B/'run-five.py').write_text(s);print('planned',len(keys),'runtime',FP)
