import json,subprocess
from copy import deepcopy
from pathlib import Path
from tools.corpus_engineering import experiments_accelerated_activity_verifier as v
p=Path('/private/tmp/cric-040-1a-runtime-values.json')
if p.exists():a=json.loads(p.read_text())
else:
 sources={r['id']:r for r in json.loads(subprocess.check_output(['git','show',v.SOURCE_REF+':'+v.SOURCE_PATH],cwd=v.APP)) if r['id'] in v.SPECS};a=v.runtime_values(sources);p.write_text(json.dumps(a))
for key,color,dy in [('SIM-C1-L004-02',0xb94f48,.64),('SIM-C1-L004-04',0x7350b0,.13),('SIM-C1-L004-04',0x147979,.12)]:
 x=deepcopy(a)
 for c in x[key]['cases']:
  for frame in [c]+c['timeSamples']:
   for e in frame['elements']:
    if e.get('kind')=='arrow' and e.get('c')==color:
     e['a'][1]-=dy;e['b'][1]-=dy
 print(key,hex(color),'old hidden position accepted:',v.compare_runtime(x)[key]['ok'])
