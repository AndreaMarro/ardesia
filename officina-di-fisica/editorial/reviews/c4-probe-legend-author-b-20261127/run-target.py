from pathlib import Path
import hashlib,json,subprocess,sys,time,shutil
APP=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
mode=sys.argv[1]
if mode=='red':
    code="import {contract} from './tests/helpers/c4-probe-contract.mjs';import {writeFileSync} from 'node:fs';writeFileSync('./tests/fixtures/c4-probe-labels/baseline-contract.json',JSON.stringify({sourceCommit:'375faa7a90f5f643840aabb8cc3076f9a2d5f5de',sourceRuntimeSha256:'3ed5bc77d8320230b62e1c3e6ca3bdd00f240cc64ec236b10fe55a306ca79251',scope:'Installed numerical/teaching/scene invariants; only three labels excluded for three IDs; not UI',records:await contract()},null,2)+'\\n');"
    subprocess.run(['node','--input-type=module','-e',code],cwd=APP,check=True)
started=time.monotonic()
p=subprocess.run(['node','--test','tests/c4-probe-legend.test.js'],cwd=APP,capture_output=True)
(OUT/(mode+'.stdout.txt')).write_bytes(p.stdout);(OUT/(mode+'.stderr.txt')).write_bytes(p.stderr)
receipt={'mode':mode,'exitCode':p.returncode,'signal':-p.returncode if p.returncode<0 else None,'elapsedSeconds':time.monotonic()-started,'freeBytesAfter':shutil.disk_usage(APP).free,'testSha256':hashlib.sha256((APP/'tests/c4-probe-legend.test.js').read_bytes()).hexdigest(),'legendSha256':hashlib.sha256((APP/'static/js/banchi/voci/legende.js').read_bytes()).hexdigest(),'UI':'NOT_RUN','scientificApproval':False,'publicationAction':'NONE'}
(OUT/(mode+'-terminal.json')).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt));print(p.stdout.decode()[-2500:])
if mode.startswith('red'):
    assert p.returncode==1,'Expected real assertion RED'
    assert b'AssertionError' in p.stdout,'Expected assertion failure, not import error'
else:
    p.check_returncode()
