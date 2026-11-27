"""Small immutable runtime fixture for portable renewal guards; never a current alias."""
from contextlib import contextmanager
from pathlib import Path
import os,shutil,subprocess,tempfile
from unittest.mock import patch
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
KNOWN={'cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc':'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'}

@contextmanager
def immutable_runtime(ref):
    if ref not in KNOWN:raise ValueError('Unknown renewal runtime')
    roots=['server','static','content','contracts','migrations','policies','extensions','package.json','package-lock.json','tools/corpus_engineering/draft_import.py']
    env={**os.environ,'GIT_NO_LAZY_FETCH':'1'}
    tracked=set(subprocess.check_output(['git','ls-tree','--name-only',ref+':officina-di-fisica'],cwd=APP.parent,env=env,text=True).splitlines())
    roots=[r for r in roots if r.split('/')[0]in tracked]
    if not {'server','static','content'}<=set(roots):raise ValueError('Expected bounded runtime roots absent')
    # git archive in a partial clone can prefetch unrelated editorial blobs.
    # Read only explicitly selected immutable runtime blobs through cat-file.
    env={**os.environ,'GIT_NO_LAZY_FETCH':'1'}
    tree=subprocess.check_output(['git','ls-tree','-rz',ref,'--',*('officina-di-fisica/'+r for r in roots)],cwd=APP.parent,env=env)
    files=[]
    for item in tree.split(b'\0'):
        if not item:continue
        metadata,name=item.split(b'\t',1);mode,kind,oid=metadata.split();name=name.decode()
        if mode not in(b'100644',b'100755')or kind!=b'blob':raise ValueError('Expected ordinary immutable runtime files')
        relative=Path(name).relative_to('officina-di-fisica')
        # The actual fingerprint excludes offline corpus schemas; this is not an API runtime input.
        if relative.parts[0]=='contracts'and relative.name.startswith('corpus-'):continue
        if relative.is_absolute()or'..'in relative.parts:raise ValueError('Unsafe fixture path')
        files.append((relative,oid.decode()))
    raw=subprocess.check_output(['git','cat-file','--batch'],input=('\n'.join(oid for _,oid in files)+'\n').encode(),cwd=APP.parent,env=env)
    with tempfile.TemporaryDirectory(prefix='cric-small-renewal-cb9-')as tmp:
        app=Path(tmp)/'officina-di-fisica'
        offset=0;used=0
        for name,oid in files:
            end=raw.index(b'\n',offset);header=raw[offset:end].decode().split();offset=end+1
            if len(header)!=3 or header[:2]!=[oid,'blob']:raise ValueError('Required runtime Git blob unavailable')
            size=int(header[2]);used+=size
            if used>16*1024**2:raise ValueError('Renewal fixture exceeds16MiB bound')
            body=raw[offset:offset+size];offset+=size+1
            if len(body)!=size or raw[offset-1:offset]!=b'\n':raise ValueError('Truncated runtime blob')
            file=app/name;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(body)
        if offset!=len(raw):raise ValueError('Unexpected trailing runtime blob data')
        for name in['node_modules/axe-core/axe.min.js','node_modules/axe-core/package.json','node_modules/playwright/package.json']:
            file=app/name;file.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(APP/name,file)
        with patch.dict(os.environ,{'ASTRA_EXTENSIONS':str(app/'extensions')}):
            before=runtime_fingerprint(app)
            if before['sha256']!=KNOWN[ref]:raise ValueError('Exact immutable fixture profile differs')
            try:yield app
            finally:
                if runtime_fingerprint(app)!=before:raise ValueError('Immutable runtime fixture drifted')
