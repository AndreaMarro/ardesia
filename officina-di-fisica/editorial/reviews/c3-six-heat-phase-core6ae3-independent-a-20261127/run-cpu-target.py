from pathlib import Path
import os,sys,subprocess,json,hashlib,time
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');D=A/'editorial/reviews/c3-six-heat-phase-core6ae3-independent-a-20261127';sys.path.insert(0,str(A))
from tools.corpus_engineering import c3_six_heat_phase_core6ae3_review_a as v
import importlib.util
spec=importlib.util.spec_from_file_location('c3_canonical_runtime_fingerprint',D/'runtime-fingerprint-canonical.verbatim.py');fpmod=importlib.util.module_from_spec(spec);spec.loader.exec_module(fpmod)
runtime_fingerprint=fpmod.runtime_fingerprint
app=Path('/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica')
fp=runtime_fingerprint(app);assert fp['sha256']==v.RUNTIME
(D/'actual-current-runtime-fingerprint.json').write_text(json.dumps(fp,indent=2)+'\n')
report=v.report();(D/'independent-cpu-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
cmd=[sys.executable,'-B','-m','unittest','tests.corpus.test_c3_six_heat_phase_core6ae3_review_a','tests.corpus.test_c3_six_source_only_models_a','-v'];t=time.monotonic();r=subprocess.run(cmd,cwd=A,capture_output=True,timeout=60,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
(D/'target-stdout.txt').write_bytes(r.stdout);(D/'target-stderr.txt').write_bytes(r.stderr)
receipt=dict(actualObservedExitCode=r.returncode,signal=-r.returncode if r.returncode<0 else None,elapsedSeconds=time.monotonic()-t,timeoutSeconds=60,timedOut=False,assistedTermination=False,command=cmd,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest());(D/'actual-cpu-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n');print(r.stderr.decode()[-3500:],receipt,flush=True);raise SystemExit(r.returncode)
