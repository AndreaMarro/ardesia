from pathlib import Path
import json,sys,shutil,subprocess,os
CORE=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(CORE))
from tools.corpus_engineering import experiment_visibility_request as v
APP=Path('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica');B=APP/'editorial/author-notes/native-vector-framing-correction-20261126';v.REPO=APP.parent
REF='ae842c451e3335b4d4caaee5d2656bdd3e58253c';FP='9279713a1f2cbb27fbb2014ae68d15b70f71ea3249c4ec33d7430a54a3fdcd0d';T=Path('/private/tmp/cric-native-vectors-framing-final-ui-app');OUT=Path('/private/tmp/cric-native-vectors-framing-final-actual-264')
def ignore(folder,names):return[n for n in names if n=='__pycache__'or(Path(folder)==APP and n in ['editorial','tests'])]
if not T.exists():shutil.copytree(APP,T,symlinks=True,ignore=ignore)
P=CORE/'editorial/reviews/c1-vector-axis-followup-95769-20261126';plan=v.load(P/'actual-ui-112/prepared.json');work=v.load(Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica/editorial/author-notes/work-axis-label-correction-20261126/actual-final-ui-40/prepared.json'))['records'][0];plan['records'].append(work)
source=v.load(APP/'editorial/author-notes/native-vector-apparatus-correction-20261126/installed-after.json');grids={'SIM-C1-L001-06':[0,90,180],'SIM-C1-L002-01':[0,45,90],'SIM-C1-L002-02':[0,4,8],'SIM-C1-L002-03':[-4,0,4],'SIM-C1-L002-04':[0,90,180],'SIM-C1-L007-01':[0,90,120,180]}
for row in plan['records']:
 row['grid']=grids[row['id']];row['expectedValues']=[next(t['model']['y']for t in source['target']if t['id']==row['id']and t['x']==x and t['stage']==1)for x in row['grid']];row['originalJudgment']={'scope':'AUTHOR technical replay only; original manual/source findings retained; independent SCI peer pending','activityCredit':0}
plan.update({'sourceCommit':REF,'scope':'AUTHOR_SIX_NATIVE_VECTOR_CORRECTION_264_TECHNICAL_CASES_NO_SCI_APPROVAL','course':'AUTHOR_NATIVE_VECTORS'})
OLD='/private/tmp/cric-c1-five-95769-review-app';oldinput=plan['inputFiles'];plan['packageFiles']=[str(T/Path(p).relative_to(OLD))for p in plan['packageFiles']];plan['inputFiles']={str(T/Path(p).relative_to(OLD)):pin for p,pin in oldinput.items()}
for name,pin in plan['inputFiles'].items():
 p=Path(name);p.parent.mkdir(parents=True,exist_ok=True);raw=v.git_bytes(REF,'officina-di-fisica/editorial/batches/'+p.name);assert v.sha(raw)==pin;p.write_bytes(raw)
primary={'role':'AUTHOR, no independent scientific acceptance for these six IDs','reuse':'Frozen source/negative observations disclosed; all181 installed physical data unchanged. Existing independent models are provenance only, not own approval.','criticalPoints':grids,'expectedReference':'Same immutable installed Node model under this source commit; browser readouts compared strictly, not own law oracle','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(B/'independent-reused-primary.json').write_bytes(v.canonical(primary)+b'\n')
for name in ['collector-c1-derived.mjs','numerical-observation.mjs']:shutil.copy2(P/name,B/name)
s=(B/'collector-c1-derived.mjs').read_text();s=s.replace('legend:legend.textContent,legendLayout:',"viewControls:[...document.querySelectorAll('[data-view]')].map(e=>({view:e.dataset.view,disabled:e.disabled})),\n  legend:legend.textContent,legendLayout:")
s=s.replace("assert.equal(measured.actualRenderer,profile.fallback?'Tavola di misura':'3D interattivo');", "assert.equal(measured.actualRenderer,profile.fallback?'Tavola di misura':'3D interattivo');assert.ok(measured.legend.includes('tavola 2D')&&measured.legend.includes('letture numeriche'));assert.ok(!measured.legend.includes('usa la vista Alto'));assert.ok(measured.viewControls.length>=3);assert.ok(['orbit','top','side'].every(view=>measured.viewControls.some(e=>e.view===view&&e.disabled===profile.fallback)));assert.ok(measured.viewControls.some(e=>e.view==='diagram'&&!e.disabled));assert.ok(!measured.elements.some(e=>e.kind==='label'&&e.text==='y'));")
(B/'collector-c1-derived.mjs').write_text(s)
r=v.load(P/'review-request.json');r.update({'candidateRef':REF,'runtimeSha256':FP,'inputFiles':plan['inputFiles'],'packageFiles':plan['packageFiles'],'scope':plan['scope'],'primarySha256':v.sha((B/'independent-reused-primary.json').read_bytes()),'collectorSha256':v.sha((B/'collector-c1-derived.mjs').read_bytes()),'numericalObservationSha256':v.sha((B/'numerical-observation.mjs').read_bytes())});(B/'review-request.json').write_bytes(v.canonical(r)+b'\n');plan['requestFile']=str(B/'review-request.json');plan['requestSha256']=v.sha((B/'review-request.json').read_bytes());plan['expectedCaseKeys']=[]
for row in plan['records']:
 for p in plan['profiles']:
  stem='|'.join([row['id'],row['variant'],str(p['width']),p['view']]);plan['expectedCaseKeys']+=[stem+'|setup']+[stem+'|grid|'+str(i)for i in range(len(row['grid']))]
assert len(plan['expectedCaseKeys'])==264
plan['runtimeFingerprint']=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=T,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(T/'extensions')}));assert plan['runtimeFingerprint']['sha256']==FP
OUT.mkdir(exist_ok=False);(OUT/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':str(T),'prepared':str(OUT/'prepared.json'),'output':str(OUT),'course':plan['course'],'requestSha256':plan['requestSha256']};(OUT/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
s=Path('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica/editorial/author-notes/work-axis-label-correction-20261126/run-author-40.py').read_text().replace('/private/tmp/cric-work-axis-author-20261126/officina-di-fisica',str(APP)).replace('b38d8b8dd1dd3d69f558bbe8753d759084aa527f',REF).replace('95769a789a6eed2cb2dde6bef3bce79d24d0f627af4dd7edcbb373a5d094202d',FP)
(B/'run-author-264.py').write_text(s)
print(OUT/'prepared-info.json')
