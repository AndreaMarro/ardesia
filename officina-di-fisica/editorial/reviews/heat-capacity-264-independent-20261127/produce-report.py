from pathlib import Path
import sys,subprocess,json,hashlib
APP=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent;ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_heat_capacity_264_independent_verifier as V
# Load current Root fingerprint by explicit path, without importing authoring.
import importlib.util
spec=importlib.util.spec_from_file_location('review_runtime_fingerprint',ROOT/'tools/corpus_engineering/runtime_fingerprint.py');FP=importlib.util.module_from_spec(spec);spec.loader.exec_module(FP)
before=FP.runtime_fingerprint(ROOT);assert before['sha256']=='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'
raw=(OUT/'package.json').read_bytes();assert hashlib.sha256(raw).hexdigest()=='b390aff5fa543893d606be517f069267d6c2ccc32be8e3b9cef7621185c9d5cb'
source_raw=(OUT/'original-source.json').read_bytes();assert hashlib.sha256(source_raw).hexdigest()=='2738799d5195ca5eda77c4dce1cdc79f708237e5660bb9cabcc7fac4f80ea3ff'
primary=(ROOT/'editorial/reviews/C3-36-source-only-primary-20261125.json').read_bytes();assert hashlib.sha256(primary).hexdigest()==V.PRIMARY_SHA
run=subprocess.run(['node',str(OUT/'probe264.mjs')],capture_output=True,text=True,timeout=45);(OUT/'actual-repeat-probe-stdout.txt').write_text(run.stdout);(OUT/'actual-repeat-probe-stderr.txt').write_text(run.stderr);assert run.returncode==0
probe=json.loads(run.stdout);assert probe==json.loads((OUT/'actual-code-probe.json').read_bytes());assert FP.runtime_fingerprint(ROOT)==before
sources={r['id']:r for r in json.loads(source_raw)};pkg=json.loads(raw);bindings=json.loads((OUT/'bindings.json').read_bytes());report=V.report(sources,pkg,bindings,probe)
assert report==V.report(sources,pkg,bindings,probe)
record=report['records'][0];assert record['candidateSha256']==V._digest(pkg['records'][0])==bindings[0]['candidateSha256'];assert record['sourceSha256']==V._digest(sources[V.KEY])==bindings[0]['sourceSha256'];assert record['ok']is False and record['candidateTextMathManualReview']['ok']is True
(OUT/'independent-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');assert json.loads((OUT/'independent-review.json').read_text())==V.report(sources,pkg,bindings,probe)
(OUT/'actual-probe-runtime-identity.json').write_text(json.dumps({'runtimeBefore':before['sha256'],'runtimeAfter':FP.runtime_fingerprint(ROOT)['sha256'],'terminalExitCode':run.returncode,'freshSavedCandidateIdentity':True,'freshSavedSourceIdentity':True,'freshSavedReportIdentity':True,'UI':'NOT_RUN','activityCredit':0},indent=2)+'\n')
print('Fresh/saved identities exact; candidate content/math pass, original prose negative retained; no activity/UI approval')
