"""Build a byte-reproducible offline installation from one committed application tree."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import urllib.request
import zipfile

APP = Path(__file__).resolve().parents[1]
PROJECT = APP.name
DIRECTORIES = {'content', 'contracts', 'examples', 'materials', 'migrations', 'policies', 'server', 'static', 'tools'}
TOP = {'app.py', 'Area autore.command', 'Avvia Officina.command', 'README.md', 'package.json'}


def build(target):
    # The Git archive supplies the exact blob and executable bit. The index and private archive never enter it.
    import io
    import tarfile
    tree = subprocess.check_output(['git','rev-parse','HEAD:'+PROJECT], cwd=APP)
    source = subprocess.check_output(['git','archive','--format=tar',tree.decode().strip()], cwd=APP)
    with tarfile.open(fileobj=io.BytesIO(source)) as archive, zipfile.ZipFile(target, 'w') as result:
        for item in sorted(archive.getmembers(), key=lambda m:m.name):
            first = item.name.split('/')[0]
            if not item.isfile() or (first not in DIRECTORIES and item.name not in TOP):
                continue
            entry = zipfile.ZipInfo(PROJECT+'/'+item.name, (1980,1,1,0,0,0))
            entry.create_system = 3
            mode = 0o755 if item.mode & 0o111 else 0o644
            entry.external_attr = (stat.S_IFREG | mode) << 16
            # STORE also reproduces the checksum across versions of the system compression library.
            result.writestr(entry, archive.extractfile(item).read())
    with target.open('rb') as built:
        return hashlib.file_digest(built, 'sha256').hexdigest()


def smoke(target):
    with tempfile.TemporaryDirectory(prefix='officina-release-') as tmp:
        tmp = Path(tmp)
        with zipfile.ZipFile(target) as package:
            if package.testzip():
                raise ValueError('Archivio ZIP danneggiato.')
            package.extractall(tmp)
            if not package.getinfo(PROJECT+'/Avvia Officina.command').external_attr >> 16 & 0o111:
                raise ValueError('Il comando di avvio richiede il bit eseguibile.')
        boot = ('from server.store import initialize;from server.web import Handler,ThreadingHTTPServer;'
                'initialize();s=ThreadingHTTPServer(("127.0.0.1",0),Handler);print(s.server_port,flush=True);s.serve_forever()')
        with subprocess.Popen(['python3','-uc',boot],cwd=tmp/PROJECT,env={**os.environ,'ASTRA_DATA':str(tmp/'dati')},
                              stdout=subprocess.PIPE, text=True) as proc:
            try:
                base = 'http://127.0.0.1:'+str(int(proc.stdout.readline()))
                with urllib.request.urlopen(base+'/api/health', timeout=12) as r:
                    assert json.load(r)['edition'] == json.loads((tmp/PROJECT/'package.json').read_text())['version']
                with urllib.request.urlopen(base+'/api/v1/openapi.json', timeout=12) as r:
                    assert 'paths' in json.load(r)
                with urllib.request.urlopen(base+'/', timeout=12) as r:
                    assert '<main' in r.read().decode()
            finally:
                proc.terminate()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Crea il pacchetto verificato dal commit corrente.')
    parser.add_argument('file', type=Path)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    args.file.parent.mkdir(parents=True, exist_ok=True)
    digest = build(args.file)
    if args.verify:
        with tempfile.TemporaryDirectory() as second:
            if digest != build(Path(second)/'officina.zip'):
                raise SystemExit('Il secondo build ha un’impronta diversa.')
        smoke(args.file)
    print(digest, args.file.name)
