from pathlib import Path
import json,subprocess,hashlib,importlib
app=Path.cwd();from tools.corpus_engineering import experiments_force_work_corrected_048_verifier as f,experiments_energy_momentum_corrected_049_verifier as e,bench_fields_optics_activity_verifier as b
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
FP='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba';assert runtime_fingerprint(app)['sha256']==FP
outputs=[]
for mod in (f,e,b):
 raw=subprocess.check_output(['git','show',mod.SOURCE_REF+':'+mod.SOURCE_PATH],cwd=app);rows={r['id']:r for r in json.loads(raw) if r['id'] in mod.READ_SOURCE_SHA256};report=mod.report(rows);assert report['failedCount']==0,(mod.BATCH,[(r['id'],r['errors']) for r in report['records'] if not r['ok']]);
 for suffix in ('','-originals'):
  path=app/'editorial/reviews'/(mod.BATCH+suffix+'.json');path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');outputs.append({'file':str(path.relative_to(app)),'sha256':sha(path.read_bytes()),'accepted':report['acceptedCount'],'checks':sum(len(r['checks']) for r in report['records']),'runtimeGrid':sum(r['runtimeComparison']['caseCount'] for r in report['records'])})
 print(mod.BATCH,report['acceptedCount'],sum(len(r['checks']) for r in report['records']),flush=True)
for group in ('foundations','vectors','forces'):
 mod=importlib.import_module('tools.corpus_engineering.experiments_'+group+'_revision_verifier');raw=subprocess.check_output(['git','show',mod.SOURCE_REF+':'+mod.SOURCE_PATH],cwd=app);rows={r['id']:r for r in json.loads(raw) if r['id'] in mod.SPECS};package=json.loads((app/'editorial/batches'/(mod.PACKAGE_NAME+'.json')).read_text());binding=json.loads((app/'editorial/batches'/(mod.PACKAGE_NAME+'-bindings.json')).read_text());report=mod.report(rows,package,binding);assert report['failedCount']==0,(mod.BATCH,[(r['id'],r['errors']) for r in report['records'] if not r['ok']]);path=app/'editorial/reviews'/(mod.BATCH+'.json');path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');outputs.append({'file':str(path.relative_to(app)),'sha256':sha(path.read_bytes()),'accepted':report['acceptedCount'],'checks':sum(len(r['checks']) for r in report['records']),'runtimeGrid':sum(r['runtimeComparison']['caseCount'] for r in report['records']),'drafts':report['draftReviewedCount']});print(mod.BATCH,report['acceptedCount'],sum(len(r['checks']) for r in report['records']),flush=True)
assert runtime_fingerprint(app)['sha256']==FP
(app/'editorial/reviews/independent-refresh-1a35-report-identities-20261125.json').write_text(json.dumps({'purpose':'GENUINELY_REEXECUTED_CURRENT_REPORTS_NO_HISTORY_RETAG','runtimeProfileSha256':FP,'files':outputs,'humanApproval':'NOT_RUN','publicationAction':'NONE'},ensure_ascii=False,indent=2)+'\n')
