"""CPU/file preparation only. Root must authorize each actual browser tranche."""
from pathlib import Path
from decimal import Decimal
import copy,hashlib,json,shutil,sys
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c3_first_law_l06_primary_models_a as m
D=Path(__file__).resolve().parent;T=APP/'editorial/reviews/c3-l0402-53bd-independent-a-20261127'
pkg=json.loads((D/'candidate.verbatim.json').read_bytes());obs=json.loads((D/'actual-consumer-observations.json').read_bytes());sources=json.loads((APP/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127/original-source.verbatim.json').read_bytes())
INPUT=D/'canonical-inputs';INPUT.mkdir(exist_ok=True)
for old,new in [('candidate.verbatim.json','experiment-c3-first-law-reading-20261127.json'),('bindings.verbatim.json','experiment-c3-first-law-reading-20261127-bindings.json')]:shutil.copyfile(D/old,INPUT/new)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();canonical=lambda r:json.dumps(r,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def wr(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
GRIDS=[[-20,-5,0,10,30,50],[-20,-10,0,2,20,30],[-20,-10,0,10,20,30],[-1,-.75,0,.25,1.5,2]]
summary=[]
for i,record in enumerate(pkg['records']):
 ID=record['id'];F=D/ID;F.mkdir(exist_ok=True)
 for w in(320,1280):
  G=F/str(w);G.mkdir(exist_ok=True);p=json.loads((T/str(w)/'prepared.json').read_bytes());r=p['records'][0];original=next(r for r in sources if r['id']==ID)
  r.update(id=ID,record=record,sourceSha256=hashlib.sha256(canonical(original)).hexdigest(),candidateSha256=hashlib.sha256(canonical(record)).hexdigest(),grid=GRIDS[i],expectedValues=[int(m.law(ID,Decimal(str(x))))for x in GRIDS[i]],clockCases=[],sourcePrediction=int(m.law(ID,Decimal(str(record['assessmentSelection']['points'][1])))))
  for q,a in zip(r['questions'],obs['rows'][i]['assessment'],strict=True):q.update(input=str(a['value']),prompt=a['prompt'])
  p['draftRecords']=pkg['records'];p['packageFiles']=[str(INPUT/'experiment-c3-first-law-reading-20261127.json')];p['inputFiles']={str(f):sha(f)for f in INPUT.iterdir()if f.is_file()};p['scope']=f'DISTINCT_A_C3_FIRST_LAW_{ID}_{w}_28_NOT_YET_AUTHORIZED';p['expectedDraftGridInputs']=6;p['expectedClockInteractions']=0;p['expectedCaseKeys']=[f'{ID}|draft|{w}|{v["view"]}|{tail}'for v in p['profiles']for tail in ['setup']+['grid|'+str(j)for j in range(6)]]
  metadata=dict(schemaVersion='1.0.0',id=ID,sourceCommit=p['sourceCommit'],runtimeSha256=p['runtimeFingerprint']['sha256'],candidateCommit='270d212b4f45151a8dc010a192a65fb13acfa24b',primaryCommit='9f3ae65969819f6476a812a120aba1c2bb9da625',scope=p['scope'],authorization='NOT_AUTHORIZED_FOR_CHROME_PREPARATION_ONLY',activityCredit=0,humanApproval='NOT_RUN')
  wr(G/'metadata.json',metadata);p['requestFile']=str(G/'metadata.json');p['requestSha256']=sha(G/'metadata.json');wr(G/'prepared.json',p);req=json.loads((T/str(w)/'request.json').read_bytes());req.update(prepared=str(G/'prepared.json'),output=str(G/'actual'));wr(G/'request.json',req)
 summary.append(dict(id=ID,grid=GRIDS[i],groups=2,casesPerGroup=28,profiles=8,clock='NOT_PRESENT_IN_COMPILED_BENCH',browser='NOT_RUN'))
wr(D/'browser-preflight.json',dict(sourceCommit='1b72b71a68a6023ab1c9fa189733947b03029914',runtimeSha256='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a',candidateCommit='270d212b4f45151a8dc010a192a65fb13acfa24b',records=summary,authorization='PREPARATION_ONLY_NO_CHROME',actualCompiledTasks=8,ownerGuestGate='TO_BE_OBSERVED_CANONICALLY_FOUR_DRAFTS',activityCredit=0,humanApproval='NOT_RUN'))
print('READY file-only: four IDs, eight28case groups; no Chrome')
