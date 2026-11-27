"""Refresh old independent derivations against new actual cb9 code observations."""
from pathlib import Path
import sys,subprocess,json,hashlib
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering import experiments_C3_code_partial_verifier as OLD
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
assert hashlib.sha256(Path(OLD.__file__).read_bytes()).hexdigest()=='9a0002b990b8bc181f90dd233a1122e2d8b48c77ecdcee240d9c8e72e16f1843'
primary=(ROOT/OLD.PRIMARY).read_bytes();assert OLD.sha(primary)==OLD.PRIMARY_SHA
source=subprocess.check_output(['git','show',OLD.REF+':'+OLD.SOURCE],cwd=ROOT);assert OLD.sha(source)==OLD.SOURCE_SHA
sources={r['id']:r for r in json.loads(source)};assert len(sources)==36
before=runtime_fingerprint(ROOT);assert before['sha256']=='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
records=[]
for group in OLD.GROUPS:
 p=OUT/(group+'-actual-code.json');data=json.loads(p.read_bytes());assert data['runtimeProfileBefore']==before['sha256']==data['runtimeProfileAfter'];assert data['UI']=='NOT_RUN'
 rows=OLD.compare(group,data,sources)
 for row in rows:row['actualCodeCollectionSha256']=OLD.sha(p.read_bytes());row['runtimeSha256']=before['sha256']
 records+=rows
assert len(records)==36 and len({r['id']for r in records})==36
# The old verifier's private oracle functions are reused unchanged; no old report,
# runtime pin, signature or accepted status is relabelled as a new one.
result={'schemaVersion':'1.0.0','phase':'ACTUAL_CB9_MATH_AND_CODE_REFRESH_PENDING_CURRENT_UI','runtimeSha256':before['sha256'],'candidateRef':'cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc','sourceRef':OLD.REF,'primarySha256':OLD.PRIMARY_SHA,'independentOracleSha256':OLD.sha(Path(OLD.__file__).read_bytes()),'recusal':{'authorOfThese36Corrections':False,'authorOfDraft263':False,'historicalReviewExposureDisclosed':True},'records':records,'mathPassed':sum(r['sourceMathAndActualTasksOk']for r in records),'codeGeometryFindings':[r['id']for r in records if not r['consumerCodeGeometryOk']],'actualGeneratedTasks':sum(len(r['actualTasks'])for r in records),'legalGridStates':sum(r['gridCount']for r in records),'clockFrames':sum(r['clockSampleCount']for r in records),'UI':'PENDING_CURRENT_REMOTE_RUN','overallComplete':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
assert runtime_fingerprint(ROOT)==before
(OUT/'actual-math-code-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k]for k in ('mathPassed','codeGeometryFindings','actualGeneratedTasks','legalGridStates','clockFrames','UI','activityCredit')}))
