#!/usr/bin/env python3
"""Build a local, unpublished public demo and optional private beta UI.

No hosting, credentials, database seeding, enrollment or publication occurs here.
Run with the lockfile runtime and already installed dependencies.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BLOCKED = {'.env', 'demo-access.json', 'study.sqlite'}


def copy_surface(source: Path, destination: Path) -> None:
    if not (source / 'index.html').is_file():
        raise ValueError(f'missing_built_index:{source}')
    for item in source.rglob('*'):
        if item.is_symlink() or item.name in BLOCKED or item.suffix in {'.sqlite', '.db', '.pem', '.key'} or item.name.startswith('.env'):
            raise ValueError(f'private_or_linked_asset:{item.name}')
    shutil.copytree(source, destination)


def assemble(destination: Path, marketing: Path, experience: Path, *, web: Path | None = None,
             studio: Path | None = None, source: dict | None = None) -> dict:
    if destination.exists():
        raise ValueError('fresh_output_directory_required')
    if (web is None) != (studio is None):
        raise ValueError('private_surfaces_must_be_paired')
    destination.mkdir(parents=True)
    try:
        copy_surface(marketing, destination / 'public')
        copy_surface(experience, destination / 'public/esperienza')
        if web is not None:
            copy_surface(web, destination / 'beta/web')
            copy_surface(studio, destination / 'beta/studio')
        assets = {str(p.relative_to(destination)): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(destination.rglob('*')) if p.is_file()}
        manifest = {'schemaVersion': 1, 'releaseState': 'local-unpublished',
                    'publicEntry': '/', 'experienceEntry': '/esperienza/?percorso=fluidi-termodinamica',
                    'commercialAction': 'manifestazione di interesse; nessuna iscrizione, account o pagamento',
                    'privateBeta': web is not None, 'privateDataIncluded': False,
                    'source': source or {}, 'assetsSha256': assets}
        (destination / 'candidate-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        return manifest
    except Exception:
        shutil.rmtree(destination)
        raise


def run(command: list[str], **kwargs) -> None:
    subprocess.run(command, cwd=ROOT, check=True, **kwargs)


def source_inventory() -> dict:
    paths = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=ROOT).decode().split('\0')
    prefixes = ('apps/web/', 'apps/studio/', 'apps/marketing-01/', 'bin/',
                'packages/engine/lessonos/', 'services/study-api/', '.github/workflows/',
                'plugins/elab-tutor/src/', 'packs/elab-tutor/')
    selected = {}
    for name in sorted(set(paths)):
        target = ROOT / name
        if (name.startswith(prefixes) or name in ('package.json', 'package-lock.json')) and '/graphify-out/' not in name and target.is_file() and not target.is_symlink():
            selected[name] = hashlib.sha256(target.read_bytes()).hexdigest()
    combined = ''.join(f'{name}\0{digest}\n' for name, digest in selected.items()).encode()
    return {'sha256': hashlib.sha256(combined).hexdigest(), 'files': selected}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--include-private', action='store_true')
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists():
        parser.error('fresh_output_directory_required')
    # Each intermediate tree is fresh; outputs never contain a demo access file.
    import tempfile
    with tempfile.TemporaryDirectory(prefix='ardesia-candidate-') as scratch:
        marketing = Path(scratch) / 'marketing'
        run(['python3', 'apps/marketing-01/build.py', '--review-examples', '--interactive-preview', '--output', str(marketing)])
        run(['npm', 'run', 'build:web:public'])
        if args.include_private:
            run(['npm', 'run', 'build:web'])
            run(['npm', '--prefix', 'apps/studio', 'run', 'build'], env={**os.environ, 'ARDESIA_STUDIO_BASE': '/studio/'})
        head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
        diff = subprocess.check_output(['git', 'diff', '--binary', 'HEAD', '--', '.github/workflows', 'apps/web', 'apps/studio', 'apps/marketing-01', 'bin', 'packages/engine/lessonos', 'services/study-api'], cwd=ROOT)
        inventory = source_inventory()
        manifest = assemble(output, marketing, ROOT / 'apps/web/dist-public',
                            web=ROOT / 'apps/web/dist' if args.include_private else None,
                            studio=ROOT / 'apps/studio/dist' if args.include_private else None,
                            source={'commit': head, 'trackedDiffSha256': hashlib.sha256(diff).hexdigest(),
                                    'sourceTreeSha256': inventory['sha256'], 'sourceFileCount': len(inventory['files']),
                                    'note': 'source tree and asset hashes identify the exact build, including uncommitted sources'})
    (output / 'source-manifest.json').write_text(json.dumps(inventory, indent=2) + '\n')
    print(f"Local unpublished candidate: {output}; {len(manifest['assetsSha256'])} assets")


if __name__ == '__main__':
    main()
