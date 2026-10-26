"""Riproduce notices e provenienza dal lock isolato, senza inventare licenze."""
from pathlib import Path
import argparse
import hashlib
import json
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
root=Path(__file__).resolve().parents[3];base=root/'plugins/s19-circuit-lab/web';lock=json.loads((base/'package-lock.json').read_text());records=[]
notices=['S19 Circuit Lab — third-party notices','Runtime packages declared by the isolated package-lock.json. Type definitions included conservatively. No upstream Pro examples or remote fonts. DOMPurify used under the Apache-2.0 alternative.','']
for key,value in lock['packages'].items():
    if not key or value.get('dev'):continue
    directory=base/key
    names=[p for p in directory.iterdir() if p.is_file() and p.name.upper().startswith(('LICENSE','COPYING','NOTICE'))]
    if not names:raise SystemExit('Missing license text: '+key)
    texts=[]
    for path in sorted(names):
        data=path.read_bytes();texts.append({'file':path.name,'sha256':hashlib.sha256(data).hexdigest()})
        notices.extend([f'--- {key} {value["version"]}: {path.name} ---',data.decode('utf8',errors='replace'),''])
    records.append({'package':key.removeprefix('node_modules/'),'version':value['version'],'license':value.get('license'),'resolved':value.get('resolved'),'integrity':value.get('integrity'),'notices':texts})
outputs={root/'handoffs/swarm-v2/S19/dependency-provenance.json':json.dumps({'lockSha256':hashlib.sha256((base/'package-lock.json').read_bytes()).hexdigest(),'packages':records},indent=2)+'\n',base/'public/THIRD_PARTY_NOTICES.txt':'\n'.join(notices)}
for target,value in outputs.items():
    if args.check:
        if target.read_text()!=value:raise SystemExit('Dependency evidence drift: '+str(target.relative_to(root)))
    else:target.write_text(value)
print(str(len(records))+' runtime/typing package notices verified')
