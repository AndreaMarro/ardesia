from pathlib import Path
import json,sys,shutil
APP=Path('/private/tmp/cric-experiment-contract-fix/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
PARENT=APP/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';B=APP/'editorial/reviews/c1-six-closures-numeric-witness-4c83-20261126';B.mkdir(exist_ok=False)
for name in ['independent-reused-primary.json','run-six.py']:shutil.copy2(PARENT/name,B/name)
s=(PARENT/'collector-c1-derived.mjs').read_text();needle="if(state.kind==='grid')assert.ok(measured.model.y===r.expectedValues[state.index],'Frozen independently reviewed numerical state drifted');"
assert s.count(needle)==1
replacement="""if(state.kind==='grid'){
      measured.exactEqualityWitness={actual:measured.model.y,expected:r.expectedValues[state.index],strictEqual:measured.model.y===r.expectedValues[state.index]};
      // This diagnostic preserves the strict decision. It only saves both raw
      // values BEFORE comparison; it never changes a model/grader/tolerance.
      await fs.appendFile(path.join(out,'pre-comparison-witness.jsonl'),JSON.stringify({caseKey,...measured.exactEqualityWitness})+'\\n');
      assert.ok(measured.exactEqualityWitness.strictEqual,'Frozen independently reviewed numerical state drifted');
     }"""
s=s.replace(needle,replacement);(B/'collector-c1-derived.mjs').write_text(s)
plan=v.load('/private/tmp/cric-c1-six-closures-4c83-actual/prepared.json');rows=[]
for r in plan['records']:
 if r['id']not in ['SIM-C1-L005-05','SIM-C1-L007-01']:continue
 x=55 if r['id']=='SIM-C1-L005-05'else 90;i=r['grid'].index(x);r.update({'grid':[x],'expectedValues':[r['expectedValues'][i]],'clockCases':[]});rows.append(r)
plan['records']=rows;plan['profiles']=[{'width':320,'fallback':False,'view':'orbit'}];plan['expectedCaseKeys']=[]
for r in rows:
 stem='|'.join([r['id'],r['variant'],'320','orbit']);plan['expectedCaseKeys'] +=[stem+'|setup',stem+'|grid|0']
r=v.load(PARENT/'review-request.json');r.update({'scope':'RAW_PRE_COMPARISON_FLOAT_DIAGNOSTIC_NO_RELAXED_DECISION','collectorSha256':v.sha((B/'collector-c1-derived.mjs').read_bytes())});(B/'review-request.json').write_bytes(v.canonical(r)+b'\n');plan.update({'requestSha256':v.sha((B/'review-request.json').read_bytes()),'requestFile':str(B/'review-request.json'),'scope':r['scope'],'course':'C1_RAW_FLOAT_WITNESS'})
out=Path('/private/tmp/cric-c1-six-closures-raw-float-actual');out.mkdir(exist_ok=False);(out/'prepared.json').write_bytes(v.canonical(plan)+b'\n');info={'candidateApp':'/private/tmp/cric-c1-six-closures-4c83-app','prepared':str(out/'prepared.json'),'output':str(out),'course':plan['course'],'requestSha256':plan['requestSha256']};(out/'prepared-info.json').write_bytes(v.canonical(info)+b'\n');print(B/'run-six.py')
