"""Actual pinned audit, prospective in-memory sections only; never writes Root."""
from pathlib import Path
from copy import deepcopy
import hashlib,json,subprocess
from tools.corpus_engineering.section_identity_audit import plan_section_corrections,assert_section_only
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');OUT=Path(__file__).resolve().parent
ref='6b746e3dafc8e86d6671865644c1e57fe1868f46';path='officina-di-fisica/editorial/reviews/cric-source-section-audit-20261127.json';raw=subprocess.check_output(['git','show',ref+':'+path],cwd=ROOT.parent);audit=json.loads(raw);assert hashlib.sha256(raw).hexdigest()=='86ab6e7daa49ee7a1dbf41b8d2cdd5efe6836a37c800ea01a6e3b0f125574ca3';(OUT/'frozen-root-audit.json').write_bytes(raw)
def enc(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def sha(v):return hashlib.sha256(v).hexdigest()
selected=[r for r in audit['rows']if r['registered']is True and r['id'].split('-')[0]in {'C1','C2','C3','C4','C5'}];names=sorted({r['batch']for r in selected});packages={n:(ROOT/f'editorial/batches/{n}.json').read_bytes()for n in names};bindings={n:(ROOT/f'editorial/batches/{n}-bindings.json').read_bytes()for n in names};paths={b['provenance']['sourcePath']for raw in bindings.values()for b in json.loads(raw)};originals={};sources={}
for path in sorted(paths):
 source=subprocess.check_output(['git','show',audit['sourceRef']+':'+path],cwd=ROOT.parent);sources[path]=sha(source);originals.update({r['id']:r for r in json.loads(source)if r.get('kind')=='question'})
plan=plan_section_corrections(audit,packages,bindings,originals);assert(plan['questionCount'],plan['packageCount'])==(250,25);proofs=[];before={}
for n in names:
 p=json.loads(packages[n]);b=json.loads(bindings[n]);newp=deepcopy(p);newb=deepcopy(b)
 for r,z in zip(newp['records'],newb):r['section']=originals[r['id']]['section'];z['candidateSha256']=sha(enc(r))
 proof=assert_section_only(p,b,newp,newb,originals,source_ref=audit['sourceRef']);assert len(proof['changedIds'])==len(p['records'])==10;proofs.append({'batch':n,**proof})
 report=ROOT/f'editorial/reviews/{n}.json';before[n]={'packageFileSha256':sha(packages[n]),'bindingsFileSha256':sha(bindings[n]),'bareScienceSha256':sha(report.read_bytes())}
for n in names:
 assert sha((ROOT/f'editorial/batches/{n}.json').read_bytes())==before[n]['packageFileSha256'];assert sha((ROOT/f'editorial/batches/{n}-bindings.json').read_bytes())==before[n]['bindingsFileSha256'];assert sha((ROOT/f'editorial/reviews/{n}.json').read_bytes())==before[n]['bareScienceSha256']
result={'schemaVersion':'1.0.0','scope':'READ_ONLY: real historical inputs checked; corrected sections exist only in disposable in-memory clones','auditCommit':ref,'auditSha256':sha(raw),'sourceFileSha256':sources,'plan':plan,'prospectiveIdentityChecks':proofs,'historicalInputChecksums':before,'rootPackagesBindingsBareReportsUnchanged':True,'correctedPackageFilesWritten':0,'freshActualRebuiltPackages':'NOT_RUN','newScientificSignatures':'NOT_RUN','importsAndProductUI':'NOT_RUN','registryOrReleaseWrites':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(OUT/'actual-plan-dry-run.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'realDeltas':250,'minimumExistingPackages':25,'strictIdentityChecks':sum(len(x['checkedIds'])for x in proofs),'changedCandidateFiles':0,'scienceApproval':'NOT_RUN','excludedHistoricalC6Rows':plan['excludedRows'],'planSha256':sha((OUT/'actual-plan-dry-run.json').read_bytes())}))
