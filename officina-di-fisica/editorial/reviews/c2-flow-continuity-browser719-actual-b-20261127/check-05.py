from pathlib import Path
from fractions import Fraction as F
import json,hashlib
p=Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/reviews/c2-flow-continuity-browser719-actual-b-20261127');rows=[];images={};states=[];setups=0
for k in ['05-320','05-1280']:
 d=p/k/'actual';a=json.loads((d/'report.json').read_text())
 for e in a['cases']:
  raw=(d/e['file']).read_bytes();assert hashlib.sha256(raw).hexdigest()==e['sha256'];c=json.loads(raw);state=c.get('interaction');row={'caseKey':c['caseKey'],'caseFile':str((d/e['file']).relative_to(p)),'caseSha256':e['sha256'],'model':c.get('model'),'screenshots':[]}
  if state is None:setups+=1
  else:
   x=F(str(state['x']));want=F(12)-x;assert c['model']['y']==float(want);states.append({'caseKey':c['caseKey'],'x':str(x),'exact_mL_per_s':str(want)})
   arrows=[e for e in c['elements']if e['kind']=='arrow'];assert len(arrows)==(2 if x in [0,12]else 3)
  for s in c['screenshots']:
   f=d/s['file'];assert hashlib.sha256(f.read_bytes()).hexdigest()==s['sha256'];images.setdefault(s['sha256'],{'image':str(f.relative_to(p)),'sha256':s['sha256'],'readDirectly':True});row['screenshots'].append(str(f.relative_to(p)))
  rows.append(row)
assert len(rows)==80 and len(states)==64 and setups==16 and len(images)==40
(p/'05-complete-check.json').write_text(json.dumps({'cases':rows,'exactStates':states,'setups':16,'uniquePNGsRead':list(images.values()),'endpointsArrowCountsVerified':True},indent=2)+'\n');print('80casehashes,64exactstates,zeroarrows,40uniquePNGs')
