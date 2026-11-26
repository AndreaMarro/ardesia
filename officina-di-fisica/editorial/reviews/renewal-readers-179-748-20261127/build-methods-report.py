from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[3]))
import json
from tools.corpus_engineering import methods_renewal_748_verifier as v
from tools.corpus_engineering.pipeline import canonical,sha
app=Path('/private/tmp/cric-method-css-748-independent-app');out=Path('editorial/reviews/renewal-readers-179-748-20261127')
sources={r['id']:r for name in['catalog.json','metodo.json']for r in json.loads((app/'content'/name).read_bytes())}
sources={k:sources[k]for k in v.IDS};first=v.report(sources,app=app);second=v.report(sources,app=app)
a=canonical(first);b=canonical(second);assert a==b
(out/'methods-activities-001-renewal-748.json').write_text(a+'\n')
(out/'methods-fresh-saved-identity.json').write_text(json.dumps({'freshCalls':2,'identical':True,'records':len(first['records']),'reportSha256':sha((a+'\n').encode()),'activityCredit':0},indent=2)+'\n')
print('16 fresh/saved records identical')
