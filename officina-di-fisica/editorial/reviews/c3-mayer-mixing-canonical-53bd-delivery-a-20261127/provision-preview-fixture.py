"""Provision only this reviewer's isolated fixture from exact read-only53bd bytes."""
from pathlib import Path
import fcntl,hashlib,json,os,shutil,subprocess
D=Path(__file__).resolve().parent;APP=D.parents[2];TASK=D.parents[5]
SOURCE=TASK/'work/cric-converged-runtime-20261127/officina-di-fisica';TARGET=TASK/'work/cric-a-c3-53bd-preview-app-20261127/officina-di-fisica'
def sha(b):return hashlib.sha256(b).hexdigest()
def copy(a,b):b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)
with(TASK/'work/.cric-browser.lock').open('a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX)
 if shutil.disk_usage(TASK).free<2*1024**3:raise SystemExit('Resource refusal before fixture provision')
 spec=json.loads((D/'fixture-provision.json').read_text())
 for name,h in spec['runtimeFiles'].items():
  assert sha((SOURCE/name).read_bytes())==h,name
  if not name.startswith('node_modules/'):copy(SOURCE/name,TARGET/name)
 node=TARGET/'node_modules'
 if not node.exists():node.symlink_to(TASK/'work/cric-resume-276/officina-di-fisica/node_modules',target_is_directory=True)
 for item in json.loads((D/'git-inputs.json').read_text())['inputs']:
  raw=(D/item['snapshot']).read_bytes();assert sha(raw)==item['sha256'];out=TARGET/Path(item['path']).relative_to('officina-di-fisica');out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw)
 copy(D/'browser-drafts.verbatim.mjs',TARGET/'tests/corpus/browser-drafts.mjs')
 for p in SOURCE.joinpath('contracts').glob('corpus-*.json'):copy(p,TARGET/'contracts'/p.name)
 B='experiment-c3-mayer-mixing-reading-53bd-20261127'
 for name in[B+'.json',B+'-bindings.json']:copy(APP/'editorial/batches'/name,TARGET/'editorial/batches'/name)
 env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','ASTRA_EXTENSIONS':str(TARGET/'extensions')}
 fp=json.loads(subprocess.check_output([str(TASK/'work/cric-runtime-env-20261127/bin/python'),'-m','tools.corpus_engineering.runtime_fingerprint'],cwd=TARGET,env=env))
 assert fp['sha256']==spec['runtimeSha256']=='53bd0c149919095e24abc8f490702494b3054367230aa941ff509ce52772d46a';print(fp['sha256'])
