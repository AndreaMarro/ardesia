"""Prepare a future pinned repetition of A's exact 312-case C6 acquisition.

This command never starts Chrome, a server, an importer, or a database. Execution
of the canonical browser producer remains a separate parent-authorized action.
Historical evidence is read only; output must be a new reviewer-owned directory.
"""
from pathlib import Path
import argparse,copy,hashlib,json,re,shutil,subprocess,sys
APP=Path(__file__).resolve().parents[2]
PRIOR=APP/'editorial/reviews/c6-family-six-0fd-independent-a-20261127'
SOURCE_SHA='6e6877e96bd91712fbcc15e530486c31a4c8087227e1292b9093876b465c292c'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def prepare(candidate_app,source_commit,runtime_sha,output,producer):
 if not re.fullmatch('[0-9a-f]{40}',source_commit)or not re.fullmatch('[0-9a-f]{64}',runtime_sha):raise ValueError('Full immutable source and runtime pins required')
 candidate_app=Path(candidate_app).resolve();output=Path(output).resolve();producer=Path(producer).resolve()
 output.relative_to(APP/'editorial/reviews')
 if output.exists():raise ValueError('New output only; preserve all prior evidence')
 if shutil.disk_usage(APP).free<2*1024**3:raise ValueError('Below2GiB; no output created')
 original=(candidate_app/'content/esperienze-C6.json').read_bytes()
 if sha(original)!=SOURCE_SHA:raise ValueError('Original C6 source changed; independent review must be revised first')
 fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=candidate_app))
 if fp['sha256']!=runtime_sha:raise ValueError('Candidate fingerprint differs')
 subprocess.run(['git','merge-base','--is-ancestor',source_commit,'HEAD'],cwd=candidate_app,check=True)
 if not producer.is_file():raise ValueError('Existing canonical producer required')
 p=copy.deepcopy(json.loads((PRIOR/'prepared.json').read_bytes()))
 if len(p['expectedCaseKeys'])!=312 or len(p['records'])!=6 or len(p['profiles'])!=8:raise ValueError('Prior312plan identity differs')
 p.update(sourceCommit=source_commit,runtimeFingerprint=fp,scope='FUTURE_DISTINCT_C6_SIX_ORIGINALS_SAME_312_PLAN_CURRENT_PIN')
 meta=dict(schemaVersion='1.0.0',role='DISTINCT_REVIEWER_A',sourceCommit=source_commit,runtimeSha256=runtime_sha,sourceFileSha256=SOURCE_SHA,numericalReference=p['numericalReference'],inputFiles=p['inputFiles'],oldPlanSha256=sha((PRIOR/'prepared.json').read_bytes()),oldHandoffSha256=sha((PRIOR/'handoff.json').read_bytes()),canonicalProducerSha256=sha(producer.read_bytes()),expectedCaseKeys=p['expectedCaseKeys'],execution='NOT_RUN_PARENT_AUTHORIZATION_REQUIRED',oldMathematicalModelsReusedWithExposure=True,noOldPngRetagging=True,activityCredit=0,humanApproval='NOT_RUN')
 raw=(json.dumps(meta,ensure_ascii=False,indent=2)+'\n').encode();p['requestFile']=str(output/'metadata.json');p['requestSha256']=sha(raw);output.mkdir()
 (output/'metadata.json').write_bytes(raw);(output/'original-source.json').write_bytes(original);(output/'prepared.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n');(output/'request.json').write_text(json.dumps(dict(candidateApp=str(candidate_app),prepared=str(output/'prepared.json'),output=str(output/'actual')),indent=2)+'\n');(output/'canonical-protocol.mjs.txt').write_bytes(producer.read_bytes())
 return dict(prepared=str(output/'prepared.json'),caseCount=312,browserExecution='NOT_RUN',activityCredit=0,humanApproval='NOT_RUN')
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--candidate-app',required=True);parser.add_argument('--source-commit',required=True);parser.add_argument('--runtime-sha256',required=True);parser.add_argument('--output',required=True);parser.add_argument('--producer',required=True);a=parser.parse_args();print(json.dumps(prepare(a.candidate_app,a.source_commit,a.runtime_sha256,a.output,a.producer)))
