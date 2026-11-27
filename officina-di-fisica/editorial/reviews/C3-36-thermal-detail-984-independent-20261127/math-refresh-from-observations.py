from pathlib import Path
import sys,json,hashlib
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering import experiments_C3_code_partial_verifier as O
assert hashlib.sha256(Path(O.__file__).read_bytes()).hexdigest()=='9a0002b990b8bc181f90dd233a1122e2d8b48c77ecdcee240d9c8e72e16f1843'
source=(OUT.parent/'C3-36-cb9-independent-20261127/frozen-original-C3.json').read_bytes();assert hashlib.sha256(source).hexdigest()==O.SOURCE_SHA;sources={r['id']:r for r in json.loads(source)};results=[];inputs=[]
for group in O.GROUPS:
 f=OUT/(group+'-actual-code.json');raw=f.read_bytes();data=json.loads(raw);assert data['runtimeProfileBefore']==data['runtimeProfileAfter']=='984466738580ad1a3eba88dd868ddd69b4111f05ff9c17e8869bb6df29cd05bc';rows=O.compare(group,data,sources);results+=rows;inputs.append({'file':f.name,'sha256':hashlib.sha256(raw).hexdigest()})
assert len(results)==36 and all(r['sourceMathAndActualTasksOk']for r in results)
result={'candidateRef':'3dd939a87fa54781761d341fbecec826ded928a8','runtimeSha256':'984466738580ad1a3eba88dd868ddd69b4111f05ff9c17e8869bb6df29cd05bc','mode':'FRESH_INDEPENDENT_ORACLES_ON_ACTUAL_CANDIDATE_CODE_OBSERVATIONS','inputs':inputs,'records':results,'mathematicsPassCount':36,'knownOriginalPedagogyNegative':'SIM-C3-L03-02, separately corrected by DRAFT264, not this runtime','activityCredit':0,'UI':'NO_OVERALL_APPROVAL_FROM_CODE_ORACLE','humanApproval':'NOT_RUN','publicationAction':'NONE'};(OUT/'actual-fresh-math-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('36 fresh mathematical comparisons passed; original prose and actual pixel judgments remain distinct')
