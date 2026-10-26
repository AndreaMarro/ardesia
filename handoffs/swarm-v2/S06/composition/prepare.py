"""Compose pinned sources in a NEW disposable directory; never edit an owner tree."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile

HERE = Path(__file__).resolve().parent
manifest = json.loads((HERE / 'source-manifest.json').read_text())
parser = argparse.ArgumentParser()
parser.add_argument('--git-dir', required=True, type=Path)
parser.add_argument('--s06-ref', required=True)
parser.add_argument('--target', required=True, type=Path)
parser.add_argument('--dependencies', required=True, type=Path)
args = parser.parse_args()
target = args.target.resolve()
if target.exists():
    raise SystemExit('target_exists: choose a new directory; no reset or overwrite')
if not (args.dependencies / 'vite').is_dir():
    raise SystemExit('existing_dependencies_required: this tool never installs packages')
target.mkdir(parents=True)


def extract(ref, paths):
    process = subprocess.Popen(['git', '--git-dir=' + str(args.git_dir.resolve()), 'archive', ref, *paths], stdout=subprocess.PIPE)
    try:
        with tarfile.open(fileobj=process.stdout, mode='r|') as archive:
            archive.extractall(target, filter='data')
    finally:
        process.stdout.close()
    if process.wait() != 0:
        raise SystemExit('pinned_source_unavailable: no network fetch attempted')


extract(args.s06_ref, ['apps/web', 'apps/studio/src', 'packages/engine', 'services/study-api', 'bin', 'package.json', 'package-lock.json'])
extract(manifest['shell'], ['apps/web/src/features/product-shell', 'apps/web/src/components/Shell.tsx'])
for item in manifest['files']:
    if hashlib.sha256((target / item['path']).read_bytes()).hexdigest() != item['beforeSha256']:
        raise SystemExit('shared_base_mismatch: ' + item['path'])
for item in manifest['namespaceFiles']:
    if hashlib.sha256((target / item['path']).read_bytes()).hexdigest() != item['sha256']:
        raise SystemExit('namespace_mismatch: ' + item['path'])
patch = gzip.decompress((HERE / 'shared-composition.patch.gz').read_bytes())
if hashlib.sha256(patch).hexdigest() != manifest['patchSha256']:
    raise SystemExit('patch_digest_mismatch')
subprocess.run(['git', 'apply', '--check', '-'], input=patch, cwd=target, check=True)
subprocess.run(['git', 'apply', '-'], input=patch, cwd=target, check=True)
for item in manifest['files']:
    assert hashlib.sha256((target / item['path']).read_bytes()).hexdigest() == item['candidateSha256']
(target / 'node_modules').symlink_to(args.dependencies.resolve(), target_is_directory=True)
fixture = target / 'handoffs/swarm-v2/S06/composition'
fixture.mkdir(parents=True)
for name in ['server.py', 'test_factory_composition.py', 'browser.mjs', 'source-manifest.json', 'shared-composition.patch.gz']:
    shutil.copyfile(HERE / name, fixture / name)
shutil.copyfile(HERE / 'SourceViewer.integration.test.tsx', target / 'apps/web/src/features/independent-study/SourceProjection.composition.test.tsx')
(target / 'COMPOSITION.json').write_text(json.dumps({**manifest, 's06TestRef': args.s06_ref, 'patchAppliedOnlyInSnapshot': True}, indent=2) + '\n')
print(target)
