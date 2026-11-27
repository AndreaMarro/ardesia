from pathlib import Path
import json,subprocess,sys,time,hashlib,importlib.util
APP=Path(__file__).resolve().parents[3];OUT=Path(__file__).resolve().parent
started=time.monotonic()
p=subprocess.run(['node','--test','tests/c4-probe-legend.test.js','tests/fluid-legend-occlusion.test.js','tests/bench-vector-annotations.test.js'],cwd=APP,capture_output=True)
(OUT/'regression.stdout.txt').write_bytes(p.stdout);(OUT/'regression.stderr.txt').write_bytes(p.stderr)
# The actual runtime fingerprint, not a substituted protocol label.
spec=importlib.util.spec_from_file_location('runtime_fp',APP/'tools/corpus_engineering/runtime_fingerprint.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
current=m.runtime_fingerprint(APP);base=json.loads((OUT/'baseline-runtime.json').read_text())
assert set(current['files'])==set(base['files'])
changed=[name for name in current['files'] if current['files'][name]!=base['files'][name]]
assert changed==['static/js/banchi/voci/legende.js'],changed
assert current['protocolSha256']==base['protocolSha256']
(OUT/'candidate-runtime.json').write_text(json.dumps(current,indent=2)+'\n')
receipt={'exitCode':p.returncode,'signal':-p.returncode if p.returncode<0 else None,'elapsedSeconds':time.monotonic()-started,'runtimeBefore':base['sha256'],'runtimeAfter':current['sha256'],'runtimeFileCount':len(current['files']),'changedRuntimeFiles':changed,'testSha256':hashlib.sha256((APP/'tests/c4-probe-legend.test.js').read_bytes()).hexdigest(),'UI':'NOT_RUN','scientificApproval':False,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
(OUT/'regression-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt));print(p.stdout.decode()[-1400:]);p.check_returncode()
