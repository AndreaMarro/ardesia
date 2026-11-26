from pathlib import Path
import sys,json,shutil,subprocess,math,os
APP=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
BASE=APP/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';BASE.mkdir(exist_ok=True)
TARGET=Path('/private/tmp/cric-c1-six-closures-4c83-app')
REF='64aef05bef5ca7ebff8491060762dd4cac0cbb34';FP='4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907'
def write(name,value): (BASE/name).write_bytes(v.canonical(value)+b'\n')
def git(name):return v.git_bytes(REF,'officina-di-fisica/'+name)
if not TARGET.exists():shutil.copytree('/private/tmp/cric-snell-4c83-review/candidate-app',TARGET,symlinks=True,ignore=shutil.ignore_patterns('editorial','__pycache__'))
inputs={};packages=[];drafts=[]
for name in ['experiment-projection-revision-118','experiment-products-revision-119','experiment-normal-revision-140']:
 for suffix in ['.json','-bindings.json']:
  path=TARGET/'editorial/batches'/(name+suffix);path.parent.mkdir(parents=True,exist_ok=True);raw=git('editorial/batches/'+path.name);path.write_bytes(raw);inputs[str(path)]=v.sha(raw)
  if suffix=='.json':packages.append(str(path));drafts+=json.loads(raw)['records']
rows=json.loads(v.git_bytes(v.ORIGINAL,'officina-di-fisica/content/esperienze-C1.json'))
specs={
'SIM-C1-L004-02':([0,.1,.9,1,2],['0','15.95'],0,'h=20m-(5m/s²)t²; t=.9s gives319/20m; rest release, g10, no drag',True,True),
'SIM-C1-L004-04':([1,3.5,4,6],['8','6.125'],2,'a=v²/(2m); v3.5m/s gives49/8m/s²; constant speed, radial acceleration, inertial frame',True,False),
'SIM-C1-L005-05':(list(range(0,76,5)),['10','15.32088886237956'],0,'N=(20N)cosα; held along incline; original40degree task retains manual FAIL; DRAFT60/0 exact10N/20N',False,False),
'SIM-C1-L006-02':([-4,-.5,0,.5,1,4,6],['-2','-0.5'],0,'F=-(50N/m)x with xcm/100m; signed restoring force; small±.5cm gives∓.25N',False,False),
'SIM-C1-L007-01':([0,90,120,180],['-6','0'],0,'W=(12J)cosα; force/displacement fixed magnitudes; at120degree=-6J and90degree0',False,False),
'SIM-C1-L008-03':([0,.25,2,2.5,5],['30','25'],2,'K=(1kg)(10m/s²)(5m-h), release from rest no dissipation; h2.5m=>25J',False,False),
}
sources=[r for r in rows if r['id']in specs];assert len(sources)==6
write('sources-six-read.json',sources)
primary={'priorExposure':'Independent original/C1 source, math and consumer reviews already performed for1a and later epochs. Reuses those independently derived models; no claim of blinded first reading. Runtime author remains distinct. This exact matrix is fixed before new UI.','records':[{'id':r['id'],'sourceSha256':v.digest(r),'modelAndManualCheck':specs[r['id']][3],'sourceManualStatus':'FAIL'if r['id']=='SIM-C1-L005-05'else'PREVIOUSLY_REVIEWED_REQUIRES_NEW_DELIVERY','grid':specs[r['id']][0],'NumberEntries':specs[r['id']][1]}for r in sources],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
write('independent-reused-primary.json',primary)
parent=APP/'tools/corpus_engineering/experiment_visibility_ui.mjs';raw=parent.read_text();assert raw.count('len(files)==4 and len(names)==2 and len(set(names))==2')==1;assert raw.count('assert.equal(checked.length,9)')==1
raw=raw.replace('len(files)==4 and len(names)==2 and len(set(names))==2','len(files)==6 and len(names)==3 and len(set(names))==3').replace('assert.equal(checked.length,9)','assert.equal(checked.length,3)').replace('All nine complete normalized owner records','All three complete normalized C1 owner records')
(BASE/'collector-c1-derived.mjs').write_text(raw)
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(TARGET/'extensions')}
fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=TARGET,env=env));assert fp['sha256']==FP
# Raw installed producer values serve strict runtime identity only; independent physics below is separate.
node="import fs from 'node:fs';import{experiments}from './static/js/banchi/voci/modelli/C1.js';const s=JSON.parse(fs.readFileSync(0));console.log(JSON.stringify(Object.fromEntries(Object.entries(s).map(([id,v])=>[id,v[0].map(x=>experiments[id].measure(x))]))));"
values=json.loads(subprocess.check_output(['node','--input-type=module','-e',node],input=json.dumps(specs).encode(),cwd=TARGET))
checks=[]
from fractions import Fraction
for key,ys in values.items():
 for x,y in zip(specs[key][0],ys):
  q=Fraction(str(x));law=(20-5*q*q if key.endswith('L004-02')else q*q/2 if key.endswith('L004-04')else -q/2 if key.endswith('L006-02')else 10*(5-q)if key.endswith('L008-03')else (20 if key.endswith('L005-05')else 12)*math.cos(float(q)*math.pi/180))
  assert abs(y-float(law))<=8*sys.float_info.epsilon*max(1,abs(float(law)))
  checks.append({'id':key,'x':x,'independentExactOrFormula':str(law),'installedValue':y,'comparison':'8ulp-bound for floating cosine/runtime arithmetic; not a grader tolerance'})
write('independent-grid-checks.json',checks)
request={'scope':'NEW_SIX_C1_CLOSURE_SUPPORT_NO_BATCH_CLOSURE_OR_ACTIVITY_CREDIT','candidateRef':REF,'runtimeSha256':FP,'originalRef':v.ORIGINAL,'sourceFileSha256':v.sha(v.git_bytes(v.ORIGINAL,'officina-di-fisica/content/esperienze-C1.json')),'inputFiles':inputs,'packageFiles':packages,'draftRecords':drafts,'primarySha256':v.sha((BASE/'independent-reused-primary.json').read_bytes()),'collectorSha256':v.sha((BASE/'collector-c1-derived.mjs').read_bytes()),'parentCollectorSha256':v.sha(parent.read_bytes()),'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
write('review-request.json',request);requestsha=v.sha((BASE/'review-request.json').read_bytes())
records=[]
for source in sources:
 key=source['id'];grid,entries,pred,_,clock,clockinput=specs[key]
 for variant,row in [('published',source)]+([('draft',next(d for d in drafts if d['id']==key))]if key=='SIM-C1-L005-05'else[]):
  if variant=='draft':entries=['10','20']
  clocks=[]
  if key.endswith('L004-02'):clocks=[{'gridIndex':grid.index(x),'time':x,'duration':2}for x in [0,2,0]]
  if key.endswith('L004-04'):
   for x in [1,6]:
    T=4*math.pi/x
    clocks +=[{'gridIndex':grid.index(x),'time':T*n/4,'duration':T}for n in range(5)]
  records.append({'id':key,'course':'C1','variant':variant,'record':row,'sourceSha256':v.digest(source),'candidateSha256':v.digest(row)if variant=='draft'else None,'grid':grid,'expectedValues':values[key],'clockCases':clocks,'auxiliaryCases':[],'questions':[{'input':e,'expectedAccepted':True,'sourceManualReadiness':False if key.endswith('L005-05')and variant=='published'else'PRIOR_SOURCE_MATH_REVIEW_REUSED','prompt':None}for e in entries],'clockInput':clockinput,'hasClock':clock,'originalJudgment':{'scope':'Original independent1a source/math findings retained; new UI not yet accepted','sourceManualityFailure':key.endswith('L005-05'),'activityCredit':0},'sourcePrediction':pred})
profiles=[{'width':w,'fallback':f,'view':p}for w in [320,1280]for f,p in [(False,'orbit'),(False,'side'),(False,'top'),(True,'fixed_projection')]]
keys=[]
for r in records:
 for p in profiles:
  stem='|'.join([r['id'],r['variant'],str(p['width']),p['view']]);keys.append(stem+'|setup')
  for kind,items in [('grid',r['grid']),('clock',r['clockCases'])]:keys +=[stem+'|'+kind+'|'+str(i)for i in range(len(items))]
assert len(keys)==616 and len(set(keys))==616
plan={'schemaVersion':'1.0.0','sourceCommit':REF,'originalRef':v.ORIGINAL,'requestSha256':requestsha,'course':'C1_SIX_HISTORICAL_CLOSURES','runtimeFingerprint':fp,'records':records,'packageFiles':packages,'requestFile':str(BASE/'review-request.json'),'inputFiles':inputs,'draftRecords':drafts,'profiles':profiles,'expectedCaseKeys':keys,'scope':request['scope'],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
out=Path('/private/tmp/cric-c1-six-closures-4c83-actual');out.mkdir(exist_ok=False)
(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n')
info={'candidateApp':str(TARGET),'prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':requestsha}
(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n');write('prepare-receipt.json',{'preparedSha256':v.sha((out/'prepared.json').read_bytes()),'planned':616,'grid':456,'clock':104,'setup':56,'candidateApp':str(TARGET),'output':str(out),'runtimeSha256':FP,'activityCredit':0});print(json.dumps({'planned':len(keys),'output':str(out),'requestSha':requestsha}))
